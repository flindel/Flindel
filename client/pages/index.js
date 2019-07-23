import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DuplicateApp from "./DuplicateItems/DuplicateApp";
import IdentifyApp from "./Confirmation/IdentifyApp2";
import SC from "./Confirmation/sortingCentre"
import Blacklist from './Confirmation/blacklist'
const ui = 0;
class Index extends React.Component{
 render(){
   if(ui == 0){
     return (
       <div>
         <DuplicateApp />
       </div>
     )
   }
   if (ui == 1){
     return (
       <div>
         <SC />
       </div>
     )
   }
   if (ui == 2){
     return (
       <div>
         <IdentifyApp />
       </div>
     )
   }
 }
}
export default Index;