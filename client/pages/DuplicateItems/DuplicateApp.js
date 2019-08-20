import React, { Component } from 'react';
import FindIssues from './FindIssues'
import TestStore from './TestStore'
import SetupGit from './SetupGit'
import Blacklist from './Blacklist'
import OnboardProcess from './OnboardProcess'
import {serveo_name} from '../config'
import { post, put, postCollection, getSmartCollections} from './Shopify'

unpublished = 0;
class DuplicateApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      gitCollectionId: 0,
      origCollectionId: 0,
      isGitSetup: false,
      isLoading: true,
      ui: 0,
      //0: Update Products app
      //1: BlackList
      //2: Onboarding
      //3: Settings
    }
    this.setIsGitSetup = this.setIsGitSetup.bind(this);
    this.extSetState = this.extSetState.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.finishUnpublish = this.finishUnpublish.bind(this);
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

  handleClick(bool){
    this.setState({isBlackList: bool});
  }

  unpublishAllGit(){
    confirm("This will stop all customers from viewing and purchasing Get it Today Products.\nAre you sure you want to proceed?")
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
        this.setState({gitProductIds: gitProductIds});
        console.log("UNPUBLISHING GET IT TODAY: ", gitProductIds);
        gitProductIds.map(id => {
          put(id,
            {"product":{
              "id": id,
              "published_at": null,
            }
          })
        }, this.finishUnpublish)
      })
  }

  finishUnpublish(){
    unpublish += 1;
    if (unpublish == this.state.gitProductIds.length){

    }
  }

  render(){
    if (this.state.ui == 0){//Update Products App
      return (
        <div>

          {(!this.state.isLoading) &&
            <TestStore
              gitCollectionId = {this.state.gitCollectionId}
            />
          }

          {this.state.isLoading && <h1>Loading Store Setup</h1>}
          <button onClick={() => this.setState({ui:1})}>Blacklist</button>
          <button onClick={() => this.setState({ui:3})}>Settings</button>
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
    if(this.state.ui == 1) {//Blacklist App
      return(
        <div>
          <button onClick={() => this.setState({ui:0})}>Product Updates</button>
          <Blacklist />
        </div>
      )
    }
    if (this.state.ui == 2){//Onboarding Process
      return(
        <div>
          {!this.state.isLoading &&
            <OnboardProcess
              gitCollectionId = {this.state.gitCollectionId}
              extSetState = {this.extSetState}
             />
          }
        </div>
      )
    }
    if (this.state.ui == 3){
      return(
        <div>
          <button onClick={() => this.setState({ui:0})}>Product Updates</button>
          <button onClick={() => this.unpublishAllGit()}>UNPUBLISH GET IT TODAY PRODUCTS</button>
        </div>
      )
    }
  }
}
export default DuplicateApp;
