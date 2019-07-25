import React, { Component } from 'react';
import {serveo_name} from '../config';
import {post, put, get, del, postGIT} from './Shopify';

let updates = [];
let reloadFunction;
let fixes = 0;
const butterfly_id = "2114548007009";

const gitPara = {
                  name:["fulfillment_service", "grams", "inventory_management", "weight"],
                  value:["flindel", 0, "shopify", 0],
                  defaultCorrection:["manual", 100, "shopify", .1]
                }

class FixIssues extends Component {
  constructor(props){
    super(props);
    this.state = {
      hasError: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  finishedFixing(data){
    fixes += 1
    console.log("Fixes", fixes)
    console.log("Updates", updates)
    if(fixes == updates.length){
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
          //this.fixUnequalParameters(updates[i]);
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
      }
    }
  }

  //PUT REQUEST
  //Copies the parameters from normal product to GIT product
  //Does not account for shifting vairants
  fixUnequalParameters(update){
    console.log("fixUnequalParameters", update);
    let gitBody = update.norm;
    gitBody.title = update.norm.title + " - Get it Today";
    /*
    for(let j = 0; j < update.norm.variants.length; j++){
      gitBody.variants[j].inventory_quantity = update.git.variants[j].inventory_quantity;
      gitBody.variants[j].old_inventory_quantity = update.git.variants[j].old_inventory_quantity;
      for(let i = 0; i < gitPara.name.length; i++){
        eval("gitBody.variants["+j+"]."+gitPara.name[i]+" = gitPara.value[i]");
      }
    }
    */
    let body = {product: gitBody};
    put(update.git.id, body, this.finishedFixing);
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
  //DOES NOT SETUP CORRECT INVENTORY
  //NEEDS TO ADD IDS TO FIRESTORE
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
