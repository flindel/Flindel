import React, {Component} from 'react';
import IdentifyApp from "./Confirmation/IdentifyApp2";
import SC from "./Confirmation/sortingCentre"
import DeliveryWarning from "./DeliveryWarning"

class Index extends React.Component{
  render(){
    return (
    <div>
      <div>
          <IdentifyApp/>
      </div>
    </div>
    );
  }
}

export default Index;
