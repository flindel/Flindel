import {serveo_name} from '../config'
import {postProduct, delProduct} from './Firestore'

export function get(product_id){
  fetch(`${serveo_name}/products?id=${encodeURIComponent(product_id)}`, {
    method: 'get',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('GET: ', data)
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
    .catch((error) => console.log(error))
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
      console.log("ORIG: ", orig);
      let out = {
        git_id: ""+data.product.id,
        orig_id: ""+orig.product.id,
        title: data.product.title.substring(0, data.product.title.length-" - Get it Today".length),
        vendor: orig.product.vendor,
      }
      console.log("OUT: ", out);
      postProduct(out);
      callback(data);
    })
    .catch((error) => console.log(error))
}

function doNothing(data){
  return;
}
