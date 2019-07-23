import React, { Component } from 'react';
import FindIssues from './FindIssues'
//import TestStore from './TestStore'
import SetupGit from './SetupGit'
import Blacklist from './Blacklist'
import { post, put, postCollection, getSmartCollections} from './Shopify'

const testControls = true;
class DuplicateApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      gitCollectionId: 0,
      origCollectionId: 0,
      isGitSetup: false,
      isLoading: true,
      isBlackList: false,
    }
    this.setIsGitSetup = this.setIsGitSetup.bind(this);
    this.extSetState = this.extSetState.bind(this);
    this.handleClick = this.handleClick.bind(this);
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

  render(){
    if (!this.state.isBlackList){
      return (
        <div>
          {this.state.isLoading && <h1>Loading Store Setup</h1>}
          <button onClick={()=> this.handleClick(true)}>Blacklist</button>
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
    } else {
      return(
        <div>
          <button onClick={()=> this.handleClick(false)}>Product Updates</button>
          <Blacklist />
        </div>
      )
    }
  }
}
export default DuplicateApp;
