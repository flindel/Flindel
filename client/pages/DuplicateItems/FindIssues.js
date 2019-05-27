import React, { Component } from 'react';
import DisplayIssue from './DisplayIssue';
//import {syncNow} from './FixIssues'


const shopName = "ds-test-yash-kini";
const collection_all_products_id = "97721974881";
const collection_get_it_today_id = "97721155681";
const location_brand_id = "21803171937";
const location_flindel_id = "21890891873";
const serveo_name = "ioco";

class FindIssues extends Component {
  constructor(){
    super();
    this.state = {
      load_all: true,
      load_git: true,
      hasCompared: false,
      all: {},
      git: {},
      desynced: [],
      updates: [],
      displayUpdates: [],
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.addDesynced = this.addDesynced.bind(this);
  }

  componentDidMount() {
    //Assumption, Brand has less than 250 inventory item/product variations
    fetch(`https://${serveo_name}.serveo.net/products?collection_id=${encodeURIComponent(collection_all_products_id)}`, {
      method: 'GET',
      })
      .then(response => response.json())
      .then(resData=> {
      this.setState({all: resData});
      this.setState({load_all: false});
    })
    fetch(`https://${serveo_name}.serveo.net/products?collection_id=${encodeURIComponent(collection_get_it_today_id)}`, {
      method: 'GET',
      })
      .then(response => response.json())
      .then(resData=> {
      this.setState({git: resData});
      this.setState({load_git: false});
    })
  }

  //Assumption, every product has a unique name
  compareUpdates(){
    let diff = [];
    diff = this.normalProductIssues().concat(this.gitProductIssues());
    this.setState({hasCompared: true});
    return diff;
  }

  normalProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.all.products.length; i++){
      let product = this.state.all.products[i];
      let gitProduct = this.findGetItTodayDuplicate(product.title);
      if (gitProduct) {
        let comparison = this.compareProducts(product, gitProduct);
        diff.push(comparison);
      } else {
        //GIT version of product does not exist
        diff.push({
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
    return null;
  }

  gitProductIssues(){
    let diff = []
    for(let i = 0; i < this.state.git.products.length; i++){
      let product = this.state.git.products[i];
      let normProduct = this.findNormalDuplicate(product.title);
      if (normProduct == null) {
        diff.push({
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
      let product = this.state.all.products[i];
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
      id: norm.id,
      name: norm.title,
      parameterIssues: this.compareProductParameters(norm, git),
      variantIssues: this.compareVariantParameters(norm, git),
    }
    if ((display_issue.parameterIssues.length != 0
      || display_issue.variant_issues.length != 0)
      &&(this.state.desynced instanceof Array)){
        display_issue.issue = "Unequal parameters";
        display_issue.solution = "The \"Original\" product's info will replace the \"Get it Today\" product's info."
        this.addDesynced(norm, git);
      }

    return display_issue;
  }

  addDesynced(norm, git){
    this.setState(prevState => {
      return {
        desynced: prevState.desynced.concat({norm: norm, git: git})
      }
    });
  }

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
        productIssues.push({
                            parameter: para[i],
                            norm: eval(norm_para[i]),
                            git: eval(git_para[i])
                          });
      }
    }
    return productIssues;
  }

  compareVariantParameters(norm, git){
    let variantIssues = [];
    if (norm.variants.length != git.variants.length) {
      //GIT does not have the same number of variants as NORM
    }
    const para = ["barcode", "compare_at_price", "image_id", "option1",
     "option2", "option3", "position", "price", "requires_shipping", "taxable",
     "title", "weight_unit"]
    for(let i = 0; i < norm.variants.length; i++){
      for(let j = 0; j < para.length; j++){
        let norm_string = "norm.variants["+i+"]."+para[j];
        let git_string = "git.variants["+i+"]."+para[j];
        if(!(eval(norm_string) === eval(git_string))) {
          variantIssues.push({
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
    if (!isLoading && !this.state.hasCompared) {
      this.state.updates = this.compareUpdates();
    }
    let displayUpdates = this.state.updates.map(update =>
      <DisplayIssue
        key = {update.id}
        name={update.name}
        parameterIssues={update.parameterIssues}
        variantIssues={update.variantIssues}
        issue = {update.issue}
        solution = {update.solution}
      />)
    let isSync = (this.state.updates.length == 0) && !isLoading;
    return (
      <div>
        <h1>{isLoading? "Loading" : "Get it Today Product Admin"}</h1>
        <h3>{isSync? "Get it Today is syncronized"
        :"Get it Today is not synchronized"}</h3>
        {!isSync && <button>FIX NOW</button>}
        {!isSync && <h3>Inventory Issues</h3>}
        <div>
          {displayUpdates}
        </div>
      </div>
    );
  }
}
export default FindIssues;
