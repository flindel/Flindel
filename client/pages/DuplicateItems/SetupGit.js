import React, { Component } from 'react';
import {postCollection} from './Shopify'

class SetupGit extends Component {
  constructor(props){
    super(props);
    this.state = {
      isGitCollectSetup: props.gitCollectionId != 0,
      isOrigCollectSetup: props.origCollectionId != 0,
      extSetState: props.extSetState,
    }
    this.callbackGit = this.callbackGit.bind(this);
    this.callbackOrig = this.callbackOrig.bind(this);
  }

  setup(){
    if (!this.state.isGitCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Get it Today",
          "rules": [
            {
              "column": "title",
              "relation": "contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackGit)
    }
    if (!this.state.isOrigCollectSetup) {
      postCollection({
        "smart_collection": {
          "title": "Original",
          "rules": [
            {
              "column": "title",
              "relation": "not_contains",
              "condition": "Get it Today"
            }
          ],
        }
      }, this.callbackOrig)
    }
  }

  callbackGit(data){
    this.state.extSetState({gitCollectionId: data.smart_collection.id})
  }

  callbackOrig(data){
    this.state.extSetState({origCollectionId: data.smart_collection.id})
  }

  render(props){
    return (
      <div>
        <h1>Flindel Setup</h1>
        <h4>Changes to your store:</h4>
        <ol>
          {!this.state.isOrigCollectSetup&&<li>Product collection "Original" will be added to your store</li>}
          {!this.state.isGitCollectSetup&&<li>Product collection "Get it Today" will be added to your store</li>}
          <li>A Flindel fulfillment service for "Get it Today" products will be added to your store.</li>
        </ol>
        <button onClick={() => this.setup()}>Setup Flindel</button>
      </div>
    )
  }
}
export default SetupGit;
