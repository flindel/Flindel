import React, { Component } from 'react';
import DisplayIssue from './DisplayIssue';
import FixIssues from './FixIssues';
import {serveo_name} from '../config'


const collection_all_products_id = "97721974881";
const collection_get_it_today_id = "97721155681";
const location_brand_id = "21803171937";
const location_flindel_id = "21890891873";

let key = 1;
const butterfly_id = "2114548007009";

class FindIssues extends Component {
  constructor(){
    super();
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
    //Assumption, Brand has less than 250 inventory item/product variations
    fetch(`https://${serveo_name}.serveo.net/collections?id=${encodeURIComponent(collection_all_products_id)}`, {
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
      .catch((error) => console.log("error"))

    fetch(`https://${serveo_name}.serveo.net/collections?id=${encodeURIComponent(collection_get_it_today_id)}`, {
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
      .catch((error) => console.log("error"))
  }

  loaded(){
    if(!this.state.load_git && !this.state.load_all){
      console.log("Norm Products: ", this.state.all);
      console.log("Git Products: ", this.state.git);
      this.compareUpdates();
    }
  }

  //Assumption, every product has a unique name
  //Variants can never swtich names
  compareUpdates(){
    let diff = [];
    diff = this.normalProductIssues().concat(this.gitProductIssues());
    this.setState({hasCompared: true});
    this.setState({updates: diff})
  }

  normalProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.all.products.length; i++){
      let product = this.state.all.products[i];
      if(this.normProductParameters(product)) {
        diff.push(this.normProductParameters(product));
      }
      let gitProduct = this.findGetItTodayDuplicate(product.title);
      if (gitProduct) {
        let comparison = this.compareProducts(product, gitProduct);
        if (comparison){diff.push(comparison);}
      } else {
        //GIT version of product does not exist
        diff.push({
          norm: product,
          git: null,
          name: product.title,
          parameterIssues: [],
          variantIssues: [],
          issue: "\"Get it Today\" version of this product does not exist",
          solution: "A \"Get it Today\" version of the product will be created"
        })
      }
    }
    return diff;
  }

  //name: String, title of original product.
  //return product duplicate Get it Today item
  findGetItTodayDuplicate(name){
    for(let i = 0; i < this.state.git.products.length; i++){
      let product = this.state.git.products[i];
      if ((name + " - Get it Today") === (product.title)){
        return product;
      }
    }
    console.log("GIT DNE: ", name);
    return null;
  }

  gitProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.git.products.length; i++){
      let product = this.state.git.products[i];
      if (this.gitProductParameters(product)){
        diff.push(this.gitProductParameters(product));
      }
      let normProduct = this.findNormalDuplicate(product.title);
      if (normProduct == null) {
        diff.push({
          norm: null,
          git: product,
          name: product.title,
          parameterIssues: [],
          variantIssues: [],
          issue: "\"Original\" version of this \"Get it Today\" product does not exist",
          solution: "This product will be deleted"
        })
      }
    }
    return diff;
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
  //DOES NOT COMPARE IMAGES, IMAGE CHANGES WILL NOT BE FLAGGED
  compareProducts(norm, git){
    let display_issue = {
      norm: norm,
      git: git,
      name: norm.title,
      parameterIssues: this.compareProductParameters(norm, git),
      variantIssues: this.compareVariantParameters(norm, git),
    }
    let para_len = display_issue.parameterIssues.length;
    let var_len = display_issue.variantIssues.length;
    if (!(para_len == 0) || !(var_len == 0)){
        display_issue.issue = "Unequal parameters";
        display_issue.solution = "The \"Original\" product's info will replace the \"Get it Today\" product's info."
        return display_issue;
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
              parameter: para.name[i],
              norm: para.value[i],
              git: eval("variant."+para.name[i]),
            });
          }
        }
      }
    //console.log("productIssues: ", productIssues)
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
    //console.log("productIssues: ", productIssues)
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

  compareVariantParameters(norm, git){
    let variantIssues = [];
    if (norm.variants.length != git.variants.length) {
      return variantIssues;
    }
    const para = ["barcode", "compare_at_price", "image_id", "option1",
     "option2", "option3", "position", "price", "requires_shipping", "taxable",
     "title", "weight_unit"]
    for(let i = 0; i < norm.variants.length; i++){
      for(let j = 0; j < para.length; j++){
        let norm_string = "norm.variants["+i+"]."+para[j];
        let git_string = "git.variants["+i+"]."+para[j];
        if(!(eval(norm_string) === eval(git_string))) {
          variantIssues.push(
          {
            parameter: para[j],
            norm: eval(norm_string),
            git: eval(git_string),
          });
        }
      }
    }
    return variantIssues;
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
        <h1>{isLoading? "Loading" : "Get it Today Product Admin"}</h1>
        {!isLoading&&<h3>{isSync? "Get it Today is syncronized"
        :"Get it Today is not synchronized"}</h3>}
        {(!isLoading&&!isSync)&&
          <FixIssues
            updates={this.state.updates}
            reloadFunction={this.componentDidMount.bind(this)}
          />}
        {!isSync && <h3>Inventory Issues</h3>}
        <div>
          {displayUpdates}
        </div>
      </div>
    );
  }
}
export default FindIssues;
