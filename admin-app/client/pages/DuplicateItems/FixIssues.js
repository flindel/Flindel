import React, { Component } from "react";

import {
  post,
  put,
  get,
  del,
  postGIT,
  postGitVariant,
  delGitVariant
} from "./Shopify";
import { getGitProduct } from "./Firestore";

const published = true;
let updates = [];
let reloadFunction;
let fixes = 0;

const gitPara = {
  name: [
    "fulfillment_service",
    "grams",
    "inventory_management",
    "weight",
    "inventory_policy"
  ],
  value: ["flindel", 0, "shopify", 0, "deny"]
};

const normPara = {
  name: ["fulfillment_service", "grams", "weight"],
  value: ["flindel", 0, 0],
  defaultCorrection: ["manual", 100, 0.1]
};

//Takes in update array from parent component FindIssues
//Goes through each update in update array and applies fixes.
class FixIssues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.print = this.print.bind(this);
    this.fixUnequalVariants = this.fixUnequalVariants.bind(this);
    this.fixGitVarDne2 = this.fixGitVarDne2.bind(this);
  }

  //tracks the number of fixes that have been completed.
  finishedFixing(data) {
    fixes += 1;
    console.log("Fixes", fixes);
    if (fixes == updates.length) {
      console.log("Finished Fixing");
      fixes = 0;
      reloadFunction();
    }
  }

  //After user clicks update products, trigger loop to go through each individual update and apply fix
  handleClick(updates1, reloadFunction1) {
    fixes = 0;
    updates = updates1;
    reloadFunction = reloadFunction1;
    for (let i = 0; i < updates.length; i++) {
      switch (updates[i].issue) {
        case "Unequal parameters":
          this.fixUnequalParameters(updates[i]);
          break;
        case '"Get it Today" version of this product does not exist':
          this.fixGitDne(updates[i]);
          break;
        case '"Original" version of this "Get it Today" product does not exist':
          this.fixNormDne(updates[i]);
          break;
        case "The Get it Today item has incorrect product information":
          this.fixGitDefaultPara(updates[i]);
          break;
        case "The Original item has information that conflicts with Get it Today":
          this.fixNormDefaultPara(updates[i]);
          break;
        case '"Get it Today" version of this product variant does not exist':
          this.fixGitVarDne(updates[i]);
          break;
        case '"Original" version of this "Get it Today" product variant does not exist':
          this.fixNormVarDne(updates[i]);
      }
    }
  }

  //Fixes any unequal parameters between GIT and original
  //Copies over information from original and replaces GIT info
  fixUnequalParameters(update) {
    let gitBody = update.norm;
    gitBody.title = update.norm.title + " - Get it Today";
    gitBody.id = update.git.id;
    getGitProduct(update.git.id, this.fixUnequalVariants, [update, gitBody]);
  }

  //Fixes any unequal variants, copies original var info and replaces git var info.
  fixUnequalVariants(fsData, args) {
    let update = args[0];
    let gitBody = args[1];
    gitBody.variants = this.normVarToGitVar(update, fsData);
    const body = { product: gitBody };
    put(update.git.id, body, this.finishedFixing);
  }

  //Fixes if a normal variant does not exist.
  //Fix will delete git variant.
  fixNormVarDne(update) {
    const product_id = update.git.id;
    const variant_id = update.variantIssues[0].gitVar;
    delGitVariant(product_id, variant_id, update, this.finishedFixing);
  }

  //Fixes if a git variant does not exist
  //Fix will create a git variant with the same info as the original variant
  fixGitVarDne(update) {
    getGitProduct(update.git.id, this.fixGitVarDne2, [update]);
  }

  //callback function for fixGitVarDne
  fixGitVarDne2(fsData, args) {
    let update = args[0];
    const variants = this.normVarToGitVar(update, fsData);
    postGitVariant(update.git.id, variants, update, this.finishedFixing);
  }

  //Converts an original variant to a GIT variant.
  //Copies over the majority of information except for fulfillment service and weight.
  normVarToGitVar(update, fsData) {
    let normVariants = update.norm.variants.slice();
    let newVariants = [];
    for (let i = 0; i < normVariants.length; i++) {
      let normVar = normVariants[i];
      let gitVarID = this.findGitVarID(fsData, normVar.id);
      let gitVar = this.findGitVar(update.git.variants, gitVarID);
      //Required git values
      for (let m = 0; m < gitPara.name.length; m++) {
        eval("normVar." + gitPara.name[m] + " = gitPara.value[m]");
      }
      normVar.id = null;
      if (gitVar !== undefined) {
        normVar.id = gitVar.id;
        normVar.product_id = update.git.id;
        normVar.sku = gitVar.id;
        normVar.inventory_quantity = gitVar.inventory_quantity;
        normVar.old_inventory_quantity = gitVar.old_inventory_quantity;
      } else {
        normVar.product_id = update.git.id;
        normVar.inventory_quantity = 0;
        normVar.old_inventory_quantity = 0;
      }
      newVariants.push(normVar);
    }
    return newVariants.slice();
  }

  //from a normal variant ID and firestore data, find git variant ID
  findGitVarID(fsData, normVarID) {
    for (let j = 0; j < fsData.variants.length; j++) {
      if (fsData.variants[j].orig_var + "" == normVarID + "") {
        return fsData.variants[j].git_var;
      }
    }
  }

  //With a git variant ID find git variant info.
  findGitVar(gitVariants, gitVarID) {
    for (let k = 0; k < gitVariants.length; k++) {
      if (gitVariants[k].id == gitVarID) {
        return gitVariants[k];
      }
    }
  }

  //Fixes if a git product does not have the correct parameters for get it Today
  //Changes fulfillment service and weight.
  fixGitDefaultPara(update) {
    let gitBody = update.git;
    for (let j = 0; j < update.git.variants.length; j++) {
      for (let i = 0; i < gitPara.name.length; i++) {
        eval(
          "gitBody.variants[" +
            j +
            "]." +
            gitPara.name[i] +
            " = gitPara.value[i]"
        );
      }
    }
    let body = { product: gitBody };
    put(update.git.id, body, this.finishedFixing);
  }

  //Fixes if a Original product has parameters that conflict with Get it Today
  //Changes value for fulfillment service to manual if set to flindel.
  //Changes value for weight to 100g if set to 0g.
  fixNormDefaultPara(update) {
    let normBody = update.norm;
    for (let j = 0; j < update.norm.variants.length; j++) {
      if (normBody.variants[j].grams == 0) {
        normBody.variants[j].weight_unit = "kg";
      }
      for (let i = 0; i < normPara.name.length; i++) {
        if (
          eval(
            "normBody.variants[" +
              j +
              "]." +
              normPara.name[i] +
              " == normPara.value[i]"
          )
        ) {
          eval(
            "normBody.variants[" +
              j +
              "]." +
              normPara.name[i] +
              " = normPara.defaultCorrection[i]"
          );
        }
      }
    }
    let body = { product: normBody };
    put(update.norm.id, body, this.finishedFixing);
  }

  //POST REQUEST
  //Creates GIT product with same parameters as NORM
  //DOES NOT ADD SKU NUMBER TO VARIANTS
  fixGitDne(update) {
    let gitBody = update.norm;
    gitBody.title = update.norm.title + " - Get it Today";
    for (let j = 0; j < update.norm.variants.length; j++) {
      gitBody.variants[j].old_inventory_quantity = 0;
      gitBody.variants[j].inventory_quantity = 0;
      gitBody.variants[j].sku = gitBody.variants[j].id;
      for (let i = 0; i < gitPara.name.length; i++) {
        eval(
          "gitBody.variants[" +
            j +
            "]." +
            gitPara.name[i] +
            " = gitPara.value[i]"
        );
      }
    }
    let body = { product: gitBody };
    postGIT(body, { product: update.norm }, this.finishedFixing);
  }

  //DEL REQUEST
  //Deletes GIT version of product
  fixNormDne(update) {
    del(update.git.id, this.finishedFixing);
  }

  print(data) {
    console.log(data);
  }

  render(props) {
    return (
      <form>
        <input
          type="button"
          value="Update All"
          onClick={() =>
            this.handleClick(this.props.updates, this.props.reloadFunction)
          }
        />
      </form>
    );
  }
}

export default FixIssues;
