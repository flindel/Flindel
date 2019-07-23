import React, { Component } from 'react';
import {serveo_name} from '../config';
import {post, put, get, del, postGIT, postGitVariant} from './Shopify';
import {getGitProduct} from './Firestore'

let updates = [];
let reloadFunction;
let fixes = 0;
const butterfly_id = "2114548007009";

const gitPara = {
                  name:["fulfillment_service", "grams", "inventory_management", "weight"],
                  value:["flindel", 0, "shopify", 0],
                  defaultCorrection:["manual", 100, "shopify", .1] //REMOVE THIS INCASE COMPANY DOES NOT USE SHOPIFY INVENTORY
                }

class FixIssues extends Component {
  constructor(props){
    super(props);
    this.state = {
      hasError: false,
    }
    this.handleClick = this.handleClick.bind(this);
    this.print = this.print.bind(this);
    this.fixUnequalVariants = this.fixUnequalVariants.bind(this);
    this.fixGitVarDne2 = this.fixGitVarDne2.bind(this);
  }

  finishedFixing(data){
    fixes += 1
    console.log("Fixes", fixes)
    if(fixes == updates.length) {
      console.log("Finished Fixing")
      reloadFunction();
    }
  }

  handleClick(updates1, reloadFunction1){
    updates = updates1;
    reloadFunction = reloadFunction1;
    console.log("Updates: ", updates);
    for(let i=0; i < updates.length; i++) {
      switch(updates[i].issue){
        case "Unequal parameters":
          this.fixUnequalParameters(updates[i]);
          break;
        case "\"Get it Today\" version of this product does not exist":
          this.fixGitDne(updates[i]);
          break;
        case "\"Original\" version of this \"Get it Today\" product does not exist":
          this.fixNormDne(updates[i]);
          break;
        case "The Get it Today item has incorrect product information":
          this.fixGitDefaultPara(updates[i]);
          break;
        case "The Original item has information that conflicts with Get it Today":
          this.fixNormDefaultPara(updates[i]);
          break;
        case "\"Get it Today\" version of this product variant does not exist":
          this.fixGitVarDne(updates[i]);
          break;
      }
    }
  }

  //PUT REQUEST
  //Copies the parameters from normal product to GIT product
  //Does not account for shifting vairants
  fixUnequalParameters(update){
    let gitBody = update.norm;
    gitBody.title = update.norm.title + " - Get it Today";
    gitBody.id = update.git.id;
    getGitProduct(update.git.id, this.fixUnequalVariants, [update, gitBody]);
  }

  fixUnequalVariants(fsData, args){
    let update = args[0];
    let gitBody = args[1];
    console.log("fixUnequalVariants",fsData, update);
    gitBody.variants = this.normVarToGitVar(update, fsData);
    const body = {product: gitBody};
    put(update.git.id, body, this.finishedFixing);
  }

  fixGitVarDne(update){
    console.log("fixGitVarDne: ", update.git.variants, update.norm.variants);
    getGitProduct(update.git.id, this.fixGitVarDne2, [update])
  }

  fixGitVarDne2(fsData, args){
    let update = args[0];
    console.log("FSDATA", fsData);
    console.log("fixGitVarDne2", update.git.variants, update.norm.variants);
    const variants = this.normVarToGitVar(update, fsData);
    postGitVariant(update.git.id, variants, update, this.finishedFixing);
  }

  normVarToGitVar(update, fsData){
    let normVariants = update.norm.variants.slice();
    let newVariants = [];
    for(let i = 0; i < normVariants.length; i++){
      let normVar = normVariants[i];
      let gitVarID = this.findGitVarID(fsData, normVar.id);
      let gitVar = this.findGitVar(update.git.variants, gitVarID);
      //Required git values
      for(let m = 0; m < gitPara.name.length; m++){
        eval("normVar."+gitPara.name[m]+" = gitPara.value[m]");
      }
      normVar.id = null;
      if (gitVar !== undefined){
        normVar.id = gitVar.id;
        normVar.product_id = update.git.id;
        normVar.sku = gitVar.sku;
        normVar.inventory_quantity = gitVar.inventory_quantity;
        normVar.old_inventory_quantity = gitVar.old_inventory_quantity;
      }else {
        normVar.product_id = update.git.id;
        normVar.inventory_quantity = 0;
        normVar.old_inventory_quantity = 0;
      }
      newVariants.push(normVar);
    }
    console.log("normVarToGitVar: ", update.git.variants, update.norm.variants);
    return newVariants.slice();
  }

  findGitVarID(fsData, normVarID){
    for (let j = 0; j < fsData.variants.length; j++){
      if (fsData.variants[j].orig_var+"" == normVarID+"") {
        return fsData.variants[j].git_var;
      }
    }
  }

  findGitVar(gitVariants, gitVarID){
    for (let k = 0; k < gitVariants.length; k++){
      if(gitVariants[k].id == gitVarID){
        return gitVariants[k];
      }
    }
  }

  fixGitDefaultPara(update){
    let gitBody = update.git;
    for(let j = 0; j < update.git.variants.length; j++){
      for(let i = 0; i < gitPara.name.length; i++){
        eval("gitBody.variants["+j+"]."+gitPara.name[i]+" = gitPara.value[i]");
      }
    }
    let body = {product: gitBody};
    put(update.git.id, body, this.finishedFixing);
  }

  fixNormDefaultPara(update){
    let normBody = update.norm;
    for(let j = 0; j < update.norm.variants.length; j++){
      for(let i = 0; i < gitPara.name.length; i++){
        if(eval("normBody.variants["+j+"]."+gitPara.name[i]+" == gitPara.value[i]")){
          eval("normBody.variants["+j+"]."+gitPara.name[i]+" = gitPara.defaultCorrection[i]");
        }
      }
    }
    let body = {product: normBody};
    put(update.norm.id, body, this.finishedFixing);
  }

  //POST REQUEST
  //Creates GIT product with same parameters as NORM
  //DOES NOT ADD SKU NUMBER TO VARIANTS
  fixGitDne(update){
    console.log("fixGitDne", update);
    let gitBody = update.norm;
    gitBody.title = update.norm.title + " - Get it Today";
    for(let j = 0; j < update.norm.variants.length; j++){
      gitBody.variants[j].old_inventory_quantity = 0;
      gitBody.variants[j].inventory_quantity = 0;
      for(let i = 0; i < gitPara.name.length; i++){
        eval("gitBody.variants["+j+"]."+gitPara.name[i]+" = gitPara.value[i]");
      }
    }
    let body = {product: gitBody};
    postGIT(body, {product: update.norm}, this.finishedFixing);
  }

  //DEL REQUEST
  //Deletes GIT version of product
  fixNormDne(update){
    del(update.git.id, this.finishedFixing);
  }

  print(data){
    console.log(data);
  }

  render(props){
    return(
      <form>
        <input
          type="button"
          value="Update All"
          onClick={() => this.handleClick(this.props.updates, this.props.reloadFunction)}
        />
      </form>
    )
  }
}

export default FixIssues;
