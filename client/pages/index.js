import React, {Component} from 'react';
import IdentifyApp from "./Confirmation/IdentifyApp2";
import SC from "./Confirmation/sortingCentre"
import DeliveryWarning from "./DeliveryWarning"
import Blacklist from './Confirmation/blacklist'

class Index extends React.Component{
  render(){
    return (
    <div>
      <div>
          <SC/>
      </div>
    </div>
    );
  }
}

export default Index;
