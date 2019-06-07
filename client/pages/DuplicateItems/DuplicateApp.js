import React, { Component } from 'react';
import FindIssues from './FindIssues'
import TestStore from './TestStore'

const testControls = true;
class DuplicateApp extends Component {
  constructor(){
    super();
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
