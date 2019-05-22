import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import IdentifyApp from "./IdentifyItems/IdentifyApp";

class Index extends React.Component{
  render(){
    return (
    <div>
      <div>
          <p>Sample app using React and Next.js</p>
          <IdentifyApp />
      </div>
    </div>
    );
  }
}

export default Index;
