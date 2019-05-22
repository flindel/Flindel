import React, { Component } from 'react';
import Search from './Search';
import ItemList from './ItemList';
import { parsePhoneNumberFromString, parsePhoneNumber, ParseError } from 'libphonenumber-js'
import './IdentifyApp.css'

const shopName="getordertest";

class IdentifyApp extends Component {
    constructor(props){
		super(props);
		this.state = {
            items:[],
            searchStatus: false
        };
        this.initStatus= true  // combine with searchStatus to control conditions for render
        this.identifyItems=this.identifyItems.bind(this) 
        this.comparePhone=this.comparePhone.bind(this)
    }
    
    //compare if input phone number matchs phone number in order info
    //set +1 as default country code
    comparePhone(orderPhone, inputPhone){
        const phoneNumber = parsePhoneNumberFromString('+1'+inputPhone)
        if(phoneNumber.format("E.164")==orderPhone){
            return true
        }else{
            return false
        }
    }

	identifyItems(orderNum, emailAdd){
        console.log("orderNum="+orderNum);
        console.log("eamilAdd=" + emailAdd);
        this.initStatus=false;
        const data = {orderNumber: orderNum, emailAddress:emailAdd};

        //get order info
        //call https://depres.../orders (backend)
            fetch(`https://depereo.serveo.net/orders?orderNum=${encodeURIComponent(data.orderNumber)}`, {
                //?orderNum=${encodeURIComponent(data.orderNumber)}
                //mode: 'no-cors',
                method: 'GET',
            })
            .then(response => console.log("react response...."+JSON.stringify(response)))
            // .then(resData=>{
            //     //check if order name exsits and the email address or phone number match
            //     if(JSON.stringify(resData.orders)!="[]"  //check order number exsit or not
            //     &&((resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase())||(this.comparePhone(resData.orders[0].phone, emailAdd)))    //check email address match or not
            //     ){
            //         this.setState({
            //             items:resData.orders[0].line_items.map(item=>{
            //                 return {
            //                     variantID:item.variant_id,
            //                     productID: item.product_id,
            //                     name: item.name,
            //                     quantity: item.quantity,
            //                     //returnQuantity: '0'
            //                 }
            //             }),
            //             searchStatus : true
            //         })
                 
            //     }else{
            //             this.setState({
            //                 searchStatus: false
            //             })              
            //     }
            // })
		
    }
    


	render() {
        if(!this.state.searchStatus&&this.initStatus){
		return (
			<div className="App">
	 		    <h1>{shopName}</h1>
	  			<Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
			</div>
        );
        }else if(!this.initStatus&&!this.state.searchStatus){
            return (
                <div className="App">
                 <h1>{shopName}</h1>
                      <Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
                      <p>Order not found!</p>
                </div>
            );
        }else {
           return (
               <ItemList items={this.state.items}/> 
               ) 
        }
	}
}

export default IdentifyApp;