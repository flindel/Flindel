import React, { Component } from 'react';
import FindIssues from './FindIssues'
import TestStore from './TestStore'
import {getProduct, postProduct, delProduct} from './Firestore'

const testControls = true;
class DuplicateApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      //product: getProduct("1234", this.loaded),
    }
    //postProduct({git_id: "9991", orig_id: "1111", variants:[{git_var: "9123", orig_var: "4567"},{git_var: "8912", orig_var: "3456"}]});
    //delProduct("1234");
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
