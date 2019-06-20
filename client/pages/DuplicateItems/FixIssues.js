import React, { Component } from 'react';
import {serveo_name} from '../config'

let updates = [];
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
      updates: [],
      hasError: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  finishedFixing(){
    fixes += 1
    console.log("Fixes", fixes)
    console.log("Updates", this.state.updates)
    if(fixes == this.state.updates.length){
      console.log("Finished Fixing")
      this.state.reloadFunction();
    }
  }

  handleClick(updates, reloadFunction){
    this.setState({updates: updates})
    this.setState({reloadFunction: reloadFunction})
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
    console.log("fixGitDne", update);
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
    this.put(update.git.id, body);
  }


  fixGitDefaultPara(update){
    let gitBody = update.git;
    for(let j = 0; j < update.git.variants.length; j++){
      for(let i = 0; i < gitPara.name.length; i++){
        eval("gitBody.variants["+j+"]."+gitPara.name[i]+" = gitPara.value[i]");
      }
    }
    let body = {product: gitBody};
    this.put(update.git.id, body);
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
    this.put(update.norm.id, body);
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
    this.post(body);
  }

  //DEL REQUEST
  //Deletes GIT version of product
  fixNormDne(update){
    this.delete(update.git.id);
  }

  get(product_id){
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, {
      method: 'get',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('GET: ', data)
      })
      .catch((error) => console.log("error"))
  }

  delete(product_id){
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('DELETE: ', data)
        this.finishedFixing();
      })
      .catch((error) => console.log("error"))
  }

  put(product_id, body){
    const options = {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(body),
    }
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, options)
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('PUT: ', data)
        this.finishedFixing();
      })
      .catch((error) => console.log("error"))
  }

  post(body){
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(body),
    }
    fetch(`https://${serveo_name}.serveo.net/products`, options)
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('POST: ', data)
        this.finishedFixing();
      })
      .catch((error) => console.log("error"))
  }

  render(props){
    return(
      <form>
        <input
          type="button"
          value="Fix Now"
          onClick={() => this.handleClick(this.props.updates, this.props.reloadFunction)}
        />
      </form>
    )
  }
}

export default FixIssues;
