import React, { Component } from 'react';
import FindIssues from './FindIssues'

class DuplicateApp extends Component {
  constructor(){
    super();
  }

  render(){
    return (
      <div>
        <FindIssues />
      </div>
    )
  }
}
export default DuplicateApp;
