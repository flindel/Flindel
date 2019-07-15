import React, { Component } from 'react';
import DisplayIssue from './DisplayIssue';
import FixIssues from './FixIssues';
import {serveo_name} from '../config'
import {get} from './Shopify'
import {getGitProduct, getOrigProduct} from './Firestore'


let collection_all_products_id = "97721974881";
let collection_get_it_today_id = "97721155681";

let key = 1;

class FindIssues extends Component {
  constructor(props){
    collection_all_products_id = props.collection_all_products_id;
    collection_get_it_today_id = props.collection_get_it_today_id;
    super(props);
    this.state = {
      load_all: true,
      load_git: true,
      hasCompared: false,
      all: {},
      git: {},
      updates: [],
      displayUpdates: [],
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.compareUpdates = this.compareUpdates.bind(this);
    this.compareProductParameters = this.compareProductParameters.bind(this);
    this.normProductIssuesLoop = this.normProductIssuesLoop.bind(this);
    this.gitProductIssuesLoop = this.gitProductIssuesLoop.bind(this);
    this.findGit = this.findGit.bind(this);
    this.findOrig = this.findOrig.bind(this);
  }

  callback(data) {
    console.log(data);
  }

  componentDidMount() {
    let normProducts = {};
    let gitProducts = {};
    this.setState({
      hasCompared: false,
      load_all: true,
      load_git: true,
      all: {},
      git: {},
      updates: [],
      displayUpdates: [],
    })
    //Assumption, Brand has less than 50 inventory item/product variations
    fetch(`${serveo_name}/collections?id=${encodeURIComponent(collection_all_products_id)}`, {
      method: 'GET',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then(resData=> {
        this.setState({all: resData});
        this.setState({load_all: false});
        this.loaded();
      })
      .catch((error) => console.log(error))

    fetch(`${serveo_name}/collections?id=${encodeURIComponent(collection_get_it_today_id)}`, {
      method: 'GET',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then(resData=> {
        this.setState({git: resData});
        this.setState({load_git: false});
        this.loaded();
      })
      .catch((error) => console.log(error))
  }

  loaded(){
    if(!this.state.load_git && !this.state.load_all){
      console.log("Norm Products: ", this.state.all);
      console.log("Git Products: ", this.state.git);
      this.compareUpdates();
    }

  }

  compareUpdates(){
    let diff = [];
    diff = this.normalProductIssues().concat(this.gitProductIssues());
    this.setState({hasCompared: true});
    this.setState({
      updates: this.state.updates.concat(diff)
    })
  }

  normalProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.all.products.length; i++){
      let product = this.state.all.products[i];
      if(this.normProductParameters(product)) {
        diff.push(this.normProductParameters(product));
      }
      getOrigProduct(product.id, this.normProductIssuesLoop);
      }
    return diff;
  }

  findGit(id){
    for (let product of this.state.git.products) {
      if (product.id+"" == id){
        return product;
      }
    }
    return {};
  }

  findOrig(id){
    for (let product of this.state.all.products) {
      if (product.id+"" == id){
        return product;
      }
    }
    return {};
  }


  normProductIssuesLoop(data){
    const product = this.findOrig(data.orig_id);
    if (data.git_id !== undefined) {
      let comparison = this.compareProducts(this.findOrig(data.orig_id), this.findGit(data.git_id), data);
      if (comparison){this.setState(this.state.updates.concat(comparison));}
    } else {
      //GIT version of product does not exist
      this.setState({
        updates: this.state.updates.concat({
          norm: product,
          git: null,
          name: product.title,
          parameterIssues: [],
          variantIssues: [],
          issue: "\"Get it Today\" version of this product does not exist",
          solution: "A \"Get it Today\" version of the product will be created"
        })
    })
  }
}

  //name: String, title of original product.
  //return product duplicate Get it Today item
  findGetItTodayDuplicate2(name){
    for(let i = 0; i < this.state.git.products.length; i++){
      let product = this.state.git.products[i];
      if ((name + " - Get it Today") === (product.title)){
        return product;
      }
    }
    return null;
  }

  gitProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.git.products.length; i++){
      let product = this.state.git.products[i];
      if (this.gitProductParameters(product)){
        diff.push(this.gitProductParameters(product));
      }
      getGitProduct(product.id, this.gitProductIssuesLoop);
    }
    return diff;
  }

  gitProductIssuesLoop(data){
    let normProduct = this.findOrig(data.orig_id);
    let gitProduct = this.findGit(data.git_id);
    if (data.orig_id == "") {
      this.setState({
        updates: this.state.updates.concat({
          norm: null,
          git: gitProduct,
          name: gitProduct.title,
          parameterIssues: [],
          variantIssues: [],
          issue: "\"Original\" version of this \"Get it Today\" product does not exist",
          solution: "This product will be deleted"
      })
    })
    }
  }

  //name: String, title of "Get it Today" product
  //return product duplicate original item if it exists
  findNormalDuplicate(name){
    for(let i = 0; i < this.state.all.products.length; i++){
      let product = this.state. all.products[i];
      if ((name) === (product.title+" - Get it Today")){
        return product;
      }
    }
    return null;
  }

  //norm: product, product ID of original item
  //git: product, product ID of duplicate get it today item
  //fsPairs: product pairs stored in firestore
  //DOES NOT COMPARE IMAGES, IMAGE CHANGES WILL NOT BE FLAGGED
  compareProducts(norm, git, fsPairs){
    let display_issue = {
      norm: norm,
      git: git,
      name: norm.title,
      parameterIssues: this.compareProductParameters(norm, git),
      variantIssues: this.compareVariantParameters(norm, git, fsPairs),
    }
    let para_len = display_issue.parameterIssues.length;
    let var_len = display_issue.variantIssues.length;
    if (!(para_len == 0) || !(var_len == 0)){
        display_issue.issue = "Unequal parameters";
        display_issue.solution = "The \"Original\" product's info will replace the \"Get it Today\" product's info."
        this.setState({
          updates: this.state.updates.concat(display_issue)
        })
      }
  }

  //norm: product, original item
  //git: product, duplicate get it today item
  //Compares all variables that should be the same between the NORM and GIT product
  compareProductParameters(norm, git){
    let productIssues = [];
    //doesn't include variants
    const para = ["options.name", "options.position", "options.values",
    "product_type", "published_scope", "tags", "template_suffix", "body_html",
    "vendor"];
    const norm_para = para.map(parameter => "norm."+parameter);
    const git_para = para.map(parameter => "git."+parameter);
    for (let i = 0; i < para.length; i++) {
      if(!(eval(norm_para[i]) === eval(git_para[i]))) {
        productIssues.push(
          {
            parameter: para[i],
            norm: eval(norm_para[i]),
            git: eval(git_para[i])
          });
      }
    }
    return productIssues;
  }

  //git: product, duplicate get it today item
  //checks if valid flindel
  gitProductParameters(git){
    let productIssues = [];
    const para = {name:["fulfillment_service", "grams", "inventory_management", "weight"],
                  value:["flindel", 0, "shopify", 0]}
    for (let j = 0; j < git.variants.length; j++){
      let variant = git.variants[j];
      for (let i = 0; i < para.name.length; i++){
        if(eval(`variant.${para.name[i]}`) !== para.value[i]){
          productIssues.push(
            {
              title: variant.title,
              parameter: para.name[i],
              norm: para.value[i],
              git: eval("variant."+para.name[i]),
            });
          }
        }
      }
    if (productIssues.length > 0){
      return ({
        norm: null,
        git: git,
        name: git.title,
        parameterIssues: [],
        variantIssues: productIssues,
        issue: "The Get it Today item has incorrect product information",
        solution: "The parameters will be changed to the correct values."
      })
    }else{
      return null;
    }
  }

  //git: product, duplicate get it today item
  //checks if valid flindel
  normProductParameters(norm){
    let productIssues = [];
    const para = {name:["fulfillment_service", "grams", "weight"],
                  value:["flindel", 0, 0],
                  defaultCorrection:["manual", 100, .1]
                }
    let solution = "";
    for (let j = 0; j < norm.variants.length; j++){
      let variant = norm.variants[j];
      for (let i = 0; i < para.name.length; i++){
        if(eval(`variant.${para.name[i]}`) == para.value[i]){
          solution += `${para.name[i]} will be set to ${para.defaultCorrection[i]}. `
          productIssues.push(
            {
              parameter: para.name[i],
              norm: para.defaultCorrection[i],
              git: eval("variant."+para.name[i]),
            });
          }
        }
      }
    if (productIssues.length > 0){
      return ({
        norm: norm,
        git: null,
        name: norm.title,
        parameterIssues: [],
        variantIssues: productIssues,
        issue: "The Original item has information that conflicts with Get it Today",
        solution: solution,
      })
    }else{
      return null;
    }
  }

  compareVariantParameters(norm, git, fsPairs){
    const varPairs = fsPairs.variants;
    let variantIssues = [];
    const para = ["barcode", "compare_at_price", "image_id", "option1",
     "option2", "option3", "price", "requires_shipping", "taxable",
     "title", "weight_unit"]
    for(let i = 0; i < varPairs.length; i++){
      //FS id -> Shopify id
      let gitVarID = varPairs[i].git_var;
      let origVarID = varPairs[i].orig_var;
      //Find index in shopify variants
      let gitIndex = this.findVarIndex(git, gitVarID);
      let origIndex = this.findVarIndex(norm, origVarID);

      if ((origIndex == -1)&&(gitIndex != -1)){ //WHAT IF GIT INDEX AND ORIG INDEX IS -1
        this.setState({
          updates: this.state.updates.concat({
            norm: norm,
            git: git,
            name: norm.title,
            parameterIssues: [],
            variantIssues: [{
              title: git.variants[gitIndex].title,
              gitVar: git.variants[gitIndex]
            }],
            issue: "\"Original\" version of this \"Get it Today\" product variant does not exist",
            solution: "The \"Get it Today\" product variant will be deleted"
          })})
      }
      else if ((gitIndex == -1)&&(origIndex != -1)){
        this.setState({
          updates: this.state.updates.concat({
            norm: norm,
            git: git,
            name: norm.title,
            parameterIssues: [],
            variantIssues: [{
              title: norm.variants[origIndex].title,
              normVar: norm.variants[origIndex]
            }],
            issue: "\"Get it Today\" version of this product variant does not exist",
            solution: "A \"Get it Today\" version of the product variant will be created"
          })})
      }
      else {
        for(let j = 0; j < para.length; j++){
          let norm_string = "norm.variants["+origIndex+"]."+para[j];
          let git_string = "git.variants["+gitIndex+"]."+para[j];
          if(!(eval(norm_string) === eval(git_string))) {
            variantIssues.push(
            {
              title: norm.variants[origIndex].title,
              parameter: para[j],
              norm: eval(norm_string),
              git: eval(git_string),
            });
          }
        }
      }
    }
    return variantIssues;
  }

  findVarIndex(product, varID){
    for(let i = 0; i < product.variants.length; i++){
      if(product.variants[i].id+"" == varID){return i;}
    }
    return -1;
  }

  render() {
    let isLoading = (this.state.load_git || this.state.load_all);
    let displayUpdates = this.state.updates.map(update =>
      <DisplayIssue
        key = {key++}
        id = {update.id}
        name={update.name}
        parameterIssues={update.parameterIssues}
        variantIssues={update.variantIssues}
        issue = {update.issue}
        solution = {update.solution}
      />)
    let isSync = displayUpdates.length ==  0;
    return (
      <div>
        <h1>{isLoading? "Loading Products" : "Get it Today Product Admin"}</h1>
        {!isLoading&&<h3>{isSync? "Get it Today is syncronized"
        :"Get it Today is not synchronized"}</h3>}
        {(!isLoading&&!isSync)&&
          <FixIssues
            updates={this.state.updates}
            reloadFunction={this.componentDidMount.bind(this)}
          />}
        {!isSync && <h3>Inventory Updates</h3>}
        <div>
          {displayUpdates}
        </div>
      </div>
    );
  }
}
export default FindIssues;
