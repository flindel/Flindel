import React, { Component } from 'react';
import FindIssues from './FindIssues'
import TestStore from './TestStore'
import SetupGit from './SetupGit'
import { post, put, postCollection, getSmartCollections} from './Shopify'

const butterfly = {"product":{"id":3884332548193,"title":"Butterfly Poster DUPLICATE","body_html":"TEXT","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-06-27T13:21:38-04:00","handle":"butterfly-poster","updated_at":"2019-06-27T16:29:46-04:00","published_at":"2019-05-10T14:38:06-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/3884332548193","variants":[{"id":29266699190369,"product_id":3884332548193,"title":"32x96","price":"12.00","sku":"","position":2,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"32x96","option2":null,"option3":null,"created_at":"2019-06-27T13:21:38-04:00","updated_at":"2019-06-27T13:21:38-04:00","taxable":true,"barcode":"","grams":100,"image_id":null,"weight":0.1,"weight_unit":"kg","inventory_item_id":30360203198561,"inventory_quantity":1,"old_inventory_quantity":1,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/29266699190369"}],"options":[{"id":5077039218785,"product_id":3884332548193,"name":"Size","position":1,"values":["32x96"]}],"images":[{"id":11840847872097,"product_id":3884332548193,"position":1,"created_at":"2019-06-27T16:29:46-04:00","updated_at":"2019-06-27T16:29:46-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly.jpg?v=1561667386","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/11840847872097"}],"image":{"id":11840847872097,"product_id":3884332548193,"position":1,"created_at":"2019-06-27T16:29:46-04:00","updated_at":"2019-06-27T16:29:46-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/butterfly.jpg?v=1561667386","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/11840847872097"}}};

const tiger = {"product":{"id":2117343936609,"title":"Tiger Poster","body_html":"","vendor":"DS Test Yash Kini","product_type":"","created_at":"2019-05-13T14:57:28-04:00","handle":"tiger-poster-1","updated_at":"2019-05-22T16:41:00-04:00","published_at":"2019-05-13T14:57:28-04:00","template_suffix":null,"tags":"","published_scope":"global","admin_graphql_api_id":"gid://shopify/Product/2117343936609","variants":[{"id":19874524594273,"product_id":2117343936609,"title":"Default Title","price":"10.00","sku":"","position":1,"inventory_policy":"deny","compare_at_price":null,"fulfillment_service":"manual","inventory_management":"shopify","option1":"Default Title","option2":null,"option3":null,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-22T16:41:00-04:00","taxable":true,"barcode":"","grams":100,"image_id":null,"weight":0.1,"weight_unit":"kg","inventory_item_id":20222117380193,"inventory_quantity":11,"old_inventory_quantity":11,"requires_shipping":true,"admin_graphql_api_id":"gid://shopify/ProductVariant/19874524594273"}],"options":[{"id":2988029935713,"product_id":2117343936609,"name":"Title","position":1,"values":["Default Title"]}],"images":[{"id":6216550875233,"product_id":2117343936609,"position":1,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-13T14:57:28-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger_fa419e24-3c3e-467a-9ce6-287594e88eec.jpg?v=1557773848","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216550875233"}],"image":{"id":6216550875233,"product_id":2117343936609,"position":1,"created_at":"2019-05-13T14:57:28-04:00","updated_at":"2019-05-13T14:57:28-04:00","alt":null,"width":3840,"height":2160,"src":"https://cdn.shopify.com/s/files/1/0092/5781/2065/products/tiger_fa419e24-3c3e-467a-9ce6-287594e88eec.jpg?v=1557773848","variant_ids":[],"admin_graphql_api_id":"gid://shopify/ProductImage/6216550875233"}}};

const testControls = true;
class DuplicateApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      gitCollectionId: 0,
      origCollectionId: 0,
      isGitSetup: false,
      isLoading: true,
    }
    this.setIsGitSetup = this.setIsGitSetup.bind(this);
    this.extSetState = this.extSetState.bind(this);
    getSmartCollections(this.setIsGitSetup);

  }

  extSetState(json){
    this.setState(json);
    getSmartCollections(this.setIsGitSetup);

  }

  setIsGitSetup(data){
    const collections = data.smart_collections;
    let isGitCollect = false;
    let isOrigCollect = false;
    for (let i = 0; i < collections.length; i++){
      if (collections[i].title == "Original"){
        isGitCollect = true;
        this.setState({origCollectionId: collections[i].id})
      }
      if (collections[i].title == "Get it Today"){
        isOrigCollect = true;
        this.setState({gitCollectionId: collections[i].id})
      }
    }
    const isGitSetup = isOrigCollect && isGitCollect;
    this.setState(
    {
      isGitSetup: isGitSetup,
      isLoading: false,
    });
  }

  render(){
    let setupGitElements = <div></div>;
    return (
      <div>
        {testControls&&<TestStore />}
        {this.state.isLoading && <h1>Loading Store Setup</h1>}
        {(!this.state.isGitSetup && !this.state.isLoading) &&
          <SetupGit
            gitCollectionId = {this.state.gitCollectionId}
            origCollectionId = {this.state.origCollectionId}
            extSetState = {this.extSetState}
          />
        }
        {this.state.isGitSetup &&
          <FindIssues
            collection_get_it_today_id = {this.state.gitCollectionId}
            collection_all_products_id = {this.state.origCollectionId}
          />
        }
      </div>
    )
  }
}
export default DuplicateApp;
