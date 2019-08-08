import React, {Component} from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import DuplicateApp from "./DuplicateItems/DuplicateApp";
import IdentifyApp from "./Confirmation/IdentifyApp2";
import FlindelWorker from "./worker/flindelWorker"

import {ui} from './config'
class Index extends React.Component{
 render(){
   if(ui == 0){
     return (
       <div>
         <DuplicateApp />
       </div>
     )
   }
   else if (ui == 1){
     return (
       <div>
         <IdentifyApp/>
       </div>
     )
   }
   else if (ui == 2){
     return (
       <div>
         <FlindelWorker/>
       </div>
     )
   }
 }
}




export default Index;
