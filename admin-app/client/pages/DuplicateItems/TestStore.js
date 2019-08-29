//DO NOT INCLUDE THIS FILE WHEN RUNNING ON A REAL SHOPIFY STORE
import React from "react"
import {serveo_name, script_tag_url, script_tag_url_returnPortal} from '../config'
import {post, postGIT, put, get, del, postScriptTag} from './Shopify'
import {getFulfillmentService} from './Firestore'


const normProduct1 = {"product":{"id":2114548007009,"title":"Butterfly Poster","body_html":"TEXT","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-10T14:38:43-04:00","handle":"butterfly-poster","updated_at":"2019-06-07T13:25:32-04:00","published_at":"2019-05-10T14:38:06-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2114548007009","variants":[{"id":19859480969313,"product_id":2114548007009,"title":"8.5x11","price":"8.00","sku":"","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"8.5x11","option2":null,"option3":null,"created_at":"2019-05-10T14:38:43-04:00","updated_at":"2019-05-22T16:42:00-04:00","taxable":true,"barcode":"","grams":100,"image_id":null,"weight":0.1,"weight_unit":"kg","inventory_item_id":20205245169761,"inventory_quantity":22,"old_inventory_quantity":22,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19859480969313"},{"id":19874811445345,"product_id":2114548007009,"title":"25x37","price":"12.00","sku":"","position":2,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"25x37","option2":null,"option3":null,"created_at":"2019-05-13T15:52:51-04:00","updated_at":"2019-05-16T14:20:40-04:00","taxable":true,"barcode":"","grams":100,"image_id":null,"weight":0.1,"weight_unit":"kg","inventory_item_id":20222427234401,"inventory_quantity":1,"old_inventory_quantity":1,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874811445345"}],"options":[{"id":2984384495713,"product_id":2114548007009,"name":"Size","position":1,"values":["8.5x11","25x37"]}],"images":[{"id":6207953567841,"product_id":2114548007009,"position":1,"created_at":"2019-05-10T14:38:50-04:00","updated_at":"2019-05-10T14:38:50-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1.jpg?v=1557513530","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207953567841"}],"image":{"id":6207953567841,"product_id":2114548007009,"position":1,"created_at":"2019-05-10T14:38:50-04:00","updated_at":"2019-05-10T14:38:50-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1.jpg?v=1557513530","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207953567841"}}};

const normProduct3 = {"product":{"id":2114548007009,"title":"Butterfly Poster","body_html":"TEXT","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-10T14:38:43-04:00","handle":"butterfly-poster","updated_at":"2019-06-07T13:25:32-04:00","published_at":"2019-05-10T14:38:06-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2114548007009",
"variants":[],"options":[{"id":2984384495713,"product_id":2114548007009,"name":"Size","position":1,"values":["8.iioo5x11","25x37"]}],"images":[{"id":6207953567841,"product_id":2114548007009,"position":1,"created_at":"2019-05-10T14:38:50-04:00","updated_at":"2019-05-10T14:38:50-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1.jpg?v=1557513530","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207953567841"}],"image":{"id":6207953567841,"product_id":2114548007009,"position":1,"created_at":"2019-05-10T14:38:50-04:00","updated_at":"2019-05-10T14:38:50-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1.jpg?v=1557513530","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207953567841"}}};


const normProduct2 = {"product":{"id":2117343936609,"title":"Tiger Poster","body_html":"","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-13T14:57:28-04:00","handle":"tiger-poster-1","updated_at":"2019-05-22T16:41:00-04:00","published_at":"2019-05-13T14:57:28-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2117343936609","variants":[{"id":19874524594273,"product_id":2117343936609,"title":"Default Title","price":"10.00","sku":"","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"Default Title","option2":null,"option3":null,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-22T16:41:00-04:00","taxable":true,"barcode":"","grams":100,"image_id":null,"weight":0.1,"weight_unit":"kg","inventory_item_id":20222117380193,"inventory_quantity":11,"old_inventory_quantity":11,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874524594273"}],"options":[{"id":2988029935713,"product_id":2117343936609,"name":"Title","position":1,"values":["Default Title"]}],"images":[{"id":6216550875233,"product_id":2117343936609,"position":1,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-13T14:57:28-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger_fa419e24-3c3e-467a-9ce6-287594e88eec.jpg?v=1557773848","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216550875233"}],"image":{"id":6216550875233,"product_id":2117343936609,"position":1,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-13T14:57:28-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger_fa419e24-3c3e-467a-9ce6-287594e88eec.jpg?v=1557773848","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216550875233"}}}

const gitProduct1 = {"product":{"id":2117343477857,"title":"Butterfly Poster - Get it Today","body_html":"Long sentence. <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-13T14:55:58-04:00","handle":"butterfly-poster-get-it-today","updated_at":"2019-06-03T11:49:36-04:00","published_at":"2019-05-13T14:55:58-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2117343477857","variants":[{"id":19874516762721,"product_id":2117343477857,"title":"8.5x11","price":"8.00","sku":"2117343477857","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"8.5x11","option2":null,"option3":null,"created_at":"2019-05-13T14:55:58-04:00","updated_at":"2019-06-03T11:49:36-04:00","taxable":true,"barcode":"","grams":1000,"image_id":null,"weight":1,"weight_unit":"kg","inventory_item_id":20222112366689,"inventory_quantity":2,"old_inventory_quantity":2,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874516762721"},{"id":19874820653153,"product_id":2117343477857,"title":"24x36","price":"10.00","sku":"1001-2117343477857-1","position":2,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"24x36","option2":null,"option3":null,"created_at":"2019-05-13T15:54:56-04:00","updated_at":"2019-05-14T11:23:33-04:00","taxable":true,"barcode":"","grams":0,"image_id":null,"weight":0,"weight_unit":"kg","inventory_item_id":20222436966497,"inventory_quantity":10,"old_inventory_quantity":10,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874820653153"}],"options":[{"id":2988029247585,"product_id":2117343477857,"name":"Size","position":1,"values":["8.5x11","24x36"]}],"images":[{"id":6216548745313,"product_id":2117343477857,"position":1,"created_at":"2019-05-13T14:55:59-04:00","updated_at":"2019-05-13T14:55:59-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1_8dd5a297-c1d3-44c4-be2b-2c99df6ab2d9.jpg?v=1557773759","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216548745313"}],"image":{"id":6216548745313,"product_id":2117343477857,"position":1,"created_at":"2019-05-13T14:55:59-04:00","updated_at":"2019-05-13T14:55:59-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1_8dd5a297-c1d3-44c4-be2b-2c99df6ab2d9.jpg?v=1557773759","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216548745313"}}}

const gitProduct2 = {"product":{"id":2114548531297,"title":"Tiger Poster - Get it Today","body_html":"<em>﻿DISCREPANCY</em>","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-10T14:39:54-04:00","handle":"tiger-poster","updated_at":"2019-05-16T17:56:03-04:00","published_at":"2019-05-10T14:39:05-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2114548531297","variants":[{"id":19859492307041,"product_id":2114548531297,"title":"Default Title","price":"11.00","sku":"1001-2114548531297-0","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"Default Title","option2":null,"option3":null,"created_at":"2019-05-10T14:39:54-04:00","updated_at":"2019-05-16T17:51:20-04:00","taxable":true,"barcode":"","grams":0,"image_id":null,"weight":0,"weight_unit":"kg","inventory_item_id":20205258276961,"inventory_quantity":3,"old_inventory_quantity":3,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19859492307041"}],"options":[{"id":2984385314913,"product_id":2114548531297,"name":"Title","position":1,"values":["Default Title"]}],"images":[{"id":6207958351969,"product_id":2114548531297,"position":1,"created_at":"2019-05-10T14:39:58-04:00","updated_at":"2019-05-10T14:39:58-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger.jpg?v=1557513598","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207958351969"}],"image":{"id":6207958351969,"product_id":2114548531297,"position":1,"created_at":"2019-05-10T14:39:58-04:00","updated_at":"2019-05-10T14:39:58-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger.jpg?v=1557513598","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6207958351969"}}}

const gitProduct3 = {"product":{"id":2117343477857,"title":"Butterfly Poster - Get it Today","body_html":"Long sentence. <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-13T14:55:58-04:00","handle":"butterfly-poster-get-it-today","updated_at":"2019-06-03T11:49:36-04:00","published_at":"2019-05-13T14:55:58-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2117343477857","variants":[{"id":19874820653153,"product_id":2117343477857,"title":"24x36","price":"10.00","sku":"1001-2117343477857-1","position":2,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"24x36","option2":null,"option3":null,"created_at":"2019-05-13T15:54:56-04:00","updated_at":"2019-05-14T11:23:33-04:00","taxable":true,"barcode":"","grams":0,"image_id":null,"weight":0,"weight_unit":"kg","inventory_item_id":20222436966497,"inventory_quantity":10,"old_inventory_quantity":10,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874820653153"}],"options":[{"id":2988029247585,"product_id":2117343477857,"name":"Size","position":1,"values":["24x36"]}],"images":[{"id":6216548745313,"product_id":2117343477857,"position":1,"created_at":"2019-05-13T14:55:59-04:00","updated_at":"2019-05-13T14:55:59-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1_8dd5a297-c1d3-44c4-be2b-2c99df6ab2d9.jpg?v=1557773759","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216548745313"}],"image":{"id":6216548745313,"product_id":2117343477857,"position":1,"created_at":"2019-05-13T14:55:59-04:00","updated_at":"2019-05-13T14:55:59-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly_1_8dd5a297-c1d3-44c4-be2b-2c99df6ab2d9.jpg?v=1557773759","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216548745313"}}}


const gitProduct4 =
{
  "product":{"id":3933379002465,"title":"Butterfly Poster - Get it Today","body_html":"TEXT","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-07-10T13:02:30-04:00","handle":"butterfly-poster-1","updated_at":"2019-07-10T13:03:08-04:00","published_at":"2019-05-10T14:38:06-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/3933379002465",
  "variants":
  [{"id":29413560516705,"product_id":3933379002465,"title":"8.5x11","price":"8.00","sku":"","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"flindel","inventory_management":"shopify","option1":"8.5x11","option2":null,"option3":null,"created_at":"2019-07-10T13:02:31-04:00","updated_at":"2019-07-10T13:03:07-04:00","taxable":true,"barcode":"","grams":0,"image_id":null,"weight":0,"weight_unit":"kg","inventory_item_id":30533694521441,"inventory_quantity":22,"old_inventory_quantity":22,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/29413560516705"}]}};

const gitProduct5 =
{
  "product": {"id":3933378969697,"title":"Tiger Poster - Get it Today","body_html":"","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-07-10T13:02:30-04:00","handle":"tiger-poster-2","updated_at":"2019-07-10T13:03:08-04:00","published_at":"2019-05-13T14:57:28-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/3933378969697",
  "variants":[{"id":29413560483937,"product_id":3933378969697,"title":"Default Title","price":"10.00","sku":"","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"flindel","inventory_management":"shopify","option1":"Default Title","option2":null,"option3":null,"created_at":"2019-07-10T13:02:30-04:00","updated_at":"2019-07-10T13:03:07-04:00","taxable":true,"barcode":"","grams":0,"image_id":null,"weight":0,"weight_unit":"kg","inventory_item_id":30533694488673,"inventory_quantity":11,"old_inventory_quantity":11,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/29413560483937"}],
  "options":[{"id":5135104311393,"product_id":3933378969697,"name":"Title","position":1,"values":["Default Title"]}],
  "images":[],"image":null}
};

const row = {
  backgroundColor: '#ff7575',
  height: '40px',
  display:'flex',
  flexWrap: 'wrap',
  justifyContent:'left',
};

const cell = {
  textAlign: 'left',
  margin: '10px',
  height: '30px',
  padding: '0px',
};

class TestStore extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      productIds: this.getProductIds(),
      gitProductIds: [],
      gitCollectionId: props.gitCollectionId,
    }
    this.getProductIds = this.getProductIds.bind(this);
  }

  getProductIds(){
    let productIds = [];
    fetch(`${serveo_name}/products/ids/`, {
      method: 'get',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        productIds = data.products.map((product) => {
        return product.id;
        })
        this.setState({productIds: productIds});
      })
      .catch((error) => console.log("error"))
  }

  publishAllGit(){
    fetch(`${serveo_name}/collections?id=${encodeURIComponent(this.state.gitCollectionId)}`, {
      method: 'GET',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then(resData=> {
        let gitProductIds = resData.products.map((product) => {
          return product.id;
        })
        console.log("PUBLISHING GET IT TODAY: ", gitProductIds);
        gitProductIds.map(id => {
          put(id,
            {"product":{
              "id": id,
              "published_at": "2007-12-31T19:00:00-05:00",
            }
          })
        })

      })
      .catch((error) => console.log(error))
  }

  async revert(){
    deleteAllGitProducts();
    //get fulfillment service ID
    const fulservId = await getFulfillmentService();
    console.log("fulservId: ", fulservId)
    deleteFulserv(fulservId);
    const gitCollectionId = await temp();
    revertScriptTag();
    deleteGitCollect(gitCollectionId);
  }

  async getGitCollection() {

  }

  deleteGitCollect(){
    fetch(`${serveo_name}/collections?id=${encodeURIComponent(this.state.gitCollectionId)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('DELETE Smart Collection: ', data)
      })
      .catch((error) => console.log(error));
  }

  deleteFulserv(fulservId){
    fetch(`${serveo_name}/fulserv?id=${encodeURIComponent(fulservId)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => {
        console.log('DELETE Fulfillment Service: ', data)
      })
      .catch((error) => console.log(error));
  }

  deleteAllGitProducts(){
    //Delete all Get it Today
    fetch(`${serveo_name}/collections?id=${encodeURIComponent(this.state.gitCollectionId)}`, {
      method: 'GET',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then(resData=> {
        let gitProductIds = resData.products.map((product) => {return product.id;})
        console.log("DELETE GIT Products: ", gitProductIds)
        gitProductIds.map(id => {del(id)})
      })
      .catch((error) => console.log(error))
  }

  //1.get all ids from db 2.delete scriptTag from Shopify by id 3. Update status as "revert" in DB
  async revertScriptTag(){
    //get all ids and save in idsArray
    let scripttagIDTemp = await fetch(`${serveo_name}/scriptTag/db/ids`, {
      method: 'get',
    })
    let scripttagIDJson = await scripttagIDTemp.json()
    const idsArray = scripttagIDJson.ids
    //for each id, delete from shopify
    for(let i=0;i<idsArray.length; i++){
      console.log(idsArray[i])
      let deleteTemp = await fetch(`${serveo_name}/scriptTag/shopify?id=${encodeURIComponent(idsArray[i])}`,{
        method:'delete'
      })
      let deleteJson = await deleteTemp.json()
      console.log(`${idsArray[i]} is deleted ${deleteJson}`)
    }
    //update status as "revert" in database
    let statusTemp = await fetch(`${serveo_name}/scriptTag/db/status`, {
      method: 'put',
    })
    let revertResp = await statusTemp.json()
    if(revertResp.success){
      console.log("ScriptTags deleted")
    }
  }

  wipeAllProducts(){
    console.log("WIPE ALL PRODUCTS", this.state.productIds);
    this.state.productIds.map(id => {
      del(id);
    });
  }

  productSetup1(){
    post(normProduct1, this.callback1);
    post(normProduct2, this.callback2);
  }

  callback1(data){
    postGIT(gitProduct1, data);
  }

  callback2(data){
    postGIT(gitProduct2, data);
  }

  productSetup2(){
    post(normProduct1);
    post(normProduct2);
  }

  callback3(data){
    postGIT();
  }

  callback4(data){
    postGIT();
  }

  productSetup3(){
    postGIT(gitProduct1, {});
    postGIT(gitProduct2, {});
  }

  finalSetup(){
    this.publishAllGit();
  }

  render(){
    return(
      <div style={row}>
        <h3>Flindel Dev Settings</h3>
        <button
          onClick={() => this.finalSetup()}
          style={cell}>Publish Changes
        </button>
        <button
          onClick={() => this.revert()}
          style={cell}>Revert
        </button>
        <button
          onClick={() => this.productSetup2()}
          style={cell}>Product Setup
        </button>
      </div>
    )
  }
}

export default TestStore;
