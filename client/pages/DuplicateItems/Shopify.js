import {serveo_name} from '../config'


export function get(product_id){
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

export function del(product_id, callback){
  fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, {
    method: 'delete',
    })
    .then((response) => {
      if(response.ok){return response.json()}
      else{throw Error(response.statusText)}
    })
    .then((data) => {
      console.log('DELETE: ', data)
      callback(data);
    })
    .catch((error) => console.log("error"))
}

export function put(product_id, body, callback){
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
      callback(data);
    })
    .catch((error) => console.log("error"))
}

export function post(body, callback){
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
      callback(data);
    })
    .catch((error) => console.log("error"))
}
