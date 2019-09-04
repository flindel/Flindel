//A bunch of front end functions that connect to shopify api
import getConfig from "next/config";
//import {serveo_name} from '../config'
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;
let api_name = API_URL;
import { postProduct, delProduct, getGitProduct } from "./Firestore";

//gets product by id
export function get(product_id, callback = doNothing) {
  fetch(`${api_name}/products?id=${encodeURIComponent(product_id)}`, {
    method: "get"
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("GET: ", data);
      callback(data);
    })
    .catch(error => console.log(error));
}

//gets shop id
export function getShopID(callback, args = []) {
  fetch(`${api_name}/shop/id/`, {
    method: "get"
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      if (args == []) {
        callback(data);
      } else {
        callback(data, args);
      }
    })
    .catch(error => console.log(error));
}

//deletes product by id, in shopify and firestore
export function del(product_id, callback = doNothing) {
  fetch(`${api_name}/products?id=${encodeURIComponent(product_id)}`, {
    method: "delete"
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("DELETE: ", data);
      delProduct("" + product_id); //removes from FIRESTORE
      callback(data);
    })
    .catch(error => console.log(error));
}

//Puts new data in existing product
export function put(product_id, body, callback = doNothing, args = []) {
  const options = {
    method: "put",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  fetch(`${api_name}/products?id=${encodeURIComponent(product_id)}`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("PUT: ", data);
      if (args == []) {
        callback(data);
      } else {
        callback(data, args);
      }
    })
    .catch(error => console.log(error));
}

//posts a new product to shopify
export function post(body, callback = doNothing) {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  fetch(`${api_name}/products`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("POST: ", data);
      callback(data);
    })
    .catch(error => console.log(error));
}

//Posts smart collection
export function postCollection(body, callback = doNothing) {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  fetch(`${api_name}/collections/`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("POST Collection: ", data);
      callback(data);
      return data;
    })
    .catch(error => console.log(error));
}

//gets smart collection
export function getSmartCollections(callback = doNothing) {
  fetch(`${api_name}/collections/all/`, {
    method: "get"
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("GET Collection: ", data);
      callback(data);
    })
    .catch(error => console.log(error));
}

//posts git variant from shopify and Firestore
export function postGitVariant(
  product_id,
  variants,
  update,
  callback = doNothing
) {
  console.log("Product ID: ", product_id);
  console.log("Variants: ", variants);
  console.log("Update: ", update);
  let body = null;
  let orig = update.norm;
  let git = update.git;
  let newVariant = {};
  for (let i = 0; i < variants.length; i++) {
    if (variants[i].id == null) {
      newVariant = variants[i];
    }
  }
  body = { variant: newVariant };
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  fetch(
    `${api_name}/products/variant?id=${encodeURIComponent(product_id)}`,
    options
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      getGitProduct(update.git.id, postGitVariantToFirestore, [
        update,
        data.variant,
        callback
      ]);
    })
    .catch(error => console.log(error));
}

//deletes GIT variant, and callsback to delete gitVariant from firestore
export function delGitVariant(
  product_id,
  variant_id,
  update,
  callback = doNothing
) {
  let orig = update.norm;
  let git = update.git;
  const options = {
    method: "delete",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  };
  fetch(
    `${api_name}/products/variant?id=${encodeURIComponent(
      product_id
    )}&variant_id=${encodeURIComponent(variant_id)}`,
    options
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      getGitProduct(update.git.id, delGitVariantFromFireStore, [
        update,
        callback,
        variant_id
      ]);
    })
    .catch(error => console.log(error));
}

//Helper function for delGitVariant
//DO NOT CALL THIS FUNCTION DIRECTLY
function delGitVariantFromFireStore(json, args) {
  console.log("Firestore JSON: ", json);
  let update = args[0];
  let callback = args[1];
  let variant_id = args[2];
  for (let i = 0; i < json.variants.length; i++) {
    if (json.variants[i].git_var == variant_id) {
      json.variants.splice(i, 1);
      break;
    }
  }
  postProduct(json, callback);
}

//Helper function for delGitVariant
//DO NOT CALL THIS FUNCTION DIRECTLY
function postGitVariantToFirestore(json, args) {
  console.log("Firestore JSON: ", json);
  let update = args[0];
  let newVariant = args[1];
  let callback = args[2];
  for (let i = 0; i < json.variants.length; i++) {
    if (
      json.variants[i].title == newVariant.title ||
      !json.variants[i].git_var
    ) {
      json.variants[i].git_var = newVariant.id;
    }
  }
  postProduct(json, callback);
}

//Adds product to shopify and adds original and GIT IDs to FIRESTORE
export function postGIT(body, orig, callback = doNothing) {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  fetch(`${api_name}/products`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("POST: ", data);
      //variants
      const out = convertToFirestoreData(data, orig);
      postProduct(out);
      callback(data);
    })
    .catch(error => console.log(error));
}

function doNothing(data) {
  return;
}

//posts script tags to shopify
export function postScriptTag(url) {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      script_tag: {
        event: "onload",
        src: url
      }
    })
  };
  fetch(`${api_name}/scriptTag/`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("POST Script Tag: ", data);
      callback(data);
    })
    .catch(error => console.log(error));
}

//posts fulfillment service to shopify
export function postFulfillmentService() {
  const options = {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  };
  fetch(`${api_name}/fulserv`, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(data => {
      console.log("POST Fulfillment Service: ", data);
      fetch(
        `${api_name}/fulserv/firestore/id?body=${encodeURIComponent(
          JSON.stringify({ fulfillment_service: data.fulfillment_service.id })
        )}`,
        {
          method: "post"
        }
      );
    })
    .catch(error => console.log(error));
}

//helper functions
//Creates an entry for firestore from GIT and Original products
function convertToFirestoreData(git, orig) {
  console.log("POST DATA: ", git, orig);
  let out = {};
  if (JSON.stringify(orig) !== "{}") {
    let variants = [];
    const maxVariants = Math.max(
      git.product.variants.length,
      orig.product.variants.length
    );
    for (let i = 0; i < maxVariants; i++) {
      let varIssue = {};
      if (git.product.variants[i] !== undefined) {
        varIssue.git_var = git.product.variants[i].id;
        varIssue.git_var_sku = git.product.variants[i].sku;
      }
      if (orig.product.variants[i] !== undefined) {
        varIssue.orig_var = orig.product.variants[i].id;
        varIssue.title = orig.product.variants[i].title;
      }
      variants.push(varIssue);
    }
    out = {
      git_id: "" + git.product.id,
      orig_id: "" + orig.product.id,
      title: git.product.title.substring(
        0,
        git.product.title.length - " - Get it Today".length
      ),
      vendor: orig.product.vendor,
      variants: variants
    };
  } else {
    let variants = [];
    for (let i = 0; i < git.product.variants.length; i++) {
      variants.push({
        git_var: git.product.variants[i].id,
        title: git.product.variants[i].title
      });
    }
    out = {
      git_id: "" + git.product.id,
      orig_id: "",
      title: git.product.title.substring(
        0,
        git.product.title.length - " - Get it Today".length
      ),
      vendor: git.product.vendor,
      variants: variants
    };
  }
  return out;
}
