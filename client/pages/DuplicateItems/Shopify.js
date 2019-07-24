import {serveo_name} from '../config'
import {postProduct, delProduct, getGitProduct} from './Firestore'

export function get(product_id, callback = doNothing){
  fetch(`${serveo_name}/products?id=${encodeURIComponent(product_id)}`, {
    method: 'get',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('GET: ', data);
      callback(data);
    })
    .catch((error) => console.log(error))
}

export function getShopID(callback, args = []){
  fetch(`${serveo_name}/shop/id/`, {
    method: 'get',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      if (args == []){
        callback(data);
      }
      else {
        callback(data, args);
      }
    })
    .catch((error) => console.log(error))
}

export function del(product_id, callback = doNothing){
  fetch(`${serveo_name}/products?id=${encodeURIComponent(product_id)}`, {
    method: 'delete',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('DELETE: ', data)
      delProduct(""+product_id); //removes from FIRESTORE
      callback(data);
    })
    .catch((error) => console.log(error));
}

export function put(product_id, body, callback = doNothing){
  const options = {
    method: 'put',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(body),
  }
  fetch(`${serveo_name}/products?id=${encodeURIComponent(product_id)}`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('PUT: ', data)
      callback(data);
    })
    .catch((error) => console.log(error))
}

export function post(body, callback = doNothing){
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(body),
  }
  fetch(`${serveo_name}/products`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('POST: ', data)
      callback(data);
    })
    .catch((error) => console.log(error))
}

export function postCollection(body, callback = doNothing){
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(body),
  }
  fetch(`${serveo_name}/collections/`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('POST Collection: ', data)
      callback(data);
    })
    .catch((error) => console.log(error))
}

export function getSmartCollections(callback = doNothing){
  fetch(`${serveo_name}/collections/all/`, {
    method: 'get',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('GET Collection: ', data);
      callback(data);
    })
    .catch((error) => console.log(error))
}

export function postGitVariant(product_id, variants, update, callback = doNothing){
  console.log("Product ID: ", product_id);
  console.log("Variants: ", variants);
  console.log("Update: ", update.git.variants, update.norm.variants);
  let body = null;
  let orig = update.norm;
  let git = update.git;
  for (let i = 0; i < variants.length; i++){
    if (variants[i].id == null){
      body = variants[i];
    }
  }
  body = {variant: body}
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(body),
  }
  console.log("PostGitVarID: ", product_id);
  fetch(`${serveo_name}/products/variant?id=${encodeURIComponent(product_id)}`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('POST Var: ', data);
      console.log("Git1: ", git)
      callback(data);
      for (let i = 0; i < variants.length; i++){
        if (variants[i].id == null){
          variants[i].id = data.variant.id;
        }
      }
      git.variants = variants.slice();
      console.log("Git2: ", git);
      const out = postData({product: JSON.parse(JSON.stringify(git))}, {product: JSON.parse(JSON.stringify(orig))});
      console.log("Formatted Body: ", out);
      postProduct(out);
    })
    .catch((error) => console.log(error))
}

//Adds product to shopify and adds original and GIT IDs to FIRESTORE
export function postGIT(body, orig, callback = doNothing){
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify(body),
  }
  fetch(`${serveo_name}/products`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('POST: ', data);
      //variants
      const out = postData(data, orig);
      postProduct(out);
      callback(data);
    })
    .catch((error) => console.log(error))
}

function postData(git, orig){
  console.log("POST DATA: ", git, orig);
  let out = {};
  if (JSON.stringify(orig) !== "{}"){
    let variants = [];
    const maxVariants = Math.max(
      git.product.variants.length,
      orig.product.variants.length
    )
    for (let i = 0; i < maxVariants; i++){
      let varIssue = {};
      if (git.product.variants[i] !== undefined){
        varIssue.git_var = git.product.variants[i].id;
        varIssue.git_var_sku = git.product.variants[i].sku;
      }
      if (orig.product.variants[i] !== undefined){
          varIssue.orig_var = orig.product.variants[i].id;
          varIssue.title = orig.product.variants[i].title
      }
      variants.push(varIssue);
    }
    out = {
      git_id: ""+git.product.id,
      orig_id: ""+orig.product.id,
      title: git.product.title.substring(0, git.product.title.length-" - Get it Today".length),
      vendor: orig.product.vendor,
      variants: variants,
    }
  }else{
    let variants = [];
    for (let i = 0; i < git.product.variants.length; i++){
      variants.push({
                    git_var: git.product.variants[i].id,
                    title: git.product.variants[i].title,
                  })
    }
    out = {
      git_id: ""+git.product.id,
      orig_id: "",
      title: git.product.title.substring(0, git.product.title.length-" - Get it Today".length),
      vendor: git.product.vendor,
      variants: variants,
    }
  }
  return out;
}

function doNothing(data){
  return;
}

export function postScriptTag(url){
  const options = {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
      body: JSON.stringify({
        "script_tag" :{
          "event":"onload",
          "src":url
        }
      }),
  }
  fetch(`${serveo_name}/scriptTag/`, options)
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('POST Script Tag: ', data)
      callback(data);
    })
    .catch((error) => console.log(error))
}
