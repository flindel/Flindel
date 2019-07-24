import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DuplicateApp from "./DuplicateItems/DuplicateApp";
import IdentifyApp from "./Confirmation/IdentifyApp2";
import SC from "./Confirmation/sortingCentre"
import Blacklist from './Confirmation/blacklist'

import ui from '../config'
//0: ADMIN APP
//1: SORTING CENTER INTERFACE
//2: RETURN PORTAL

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
