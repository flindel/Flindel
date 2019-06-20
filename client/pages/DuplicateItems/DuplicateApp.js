import React, { Component } from 'react';
import FindIssues from './FindIssues'
import TestStore from './TestStore'
import {getProduct, postProduct} from './Firestore'
import {serveo_name} from '../config'

const testControls = true;
class DuplicateApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      product: getProduct("1234", this.loaded),
    }
    postProduct({git_id: "1234", original_id: "5678", variants:[{gitVar: "9123", origVar: "4567"},{gitVar: "8912", origVar: "3456"}]});
  }

  loaded(json){
    console.log("JSON", json);
  }


  render(){
    return (
      <div>
        {testControls&&<TestStore />}
        <FindIssues />
      </div>
    )
  }
}
export default DuplicateApp;
