import React, { Component } from 'react';
import Search from './Search';
import ItemList from './ItemList';

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
    }

	identifyItems(orderNum, emailAdd){
        console.log("orderNum="+orderNum);
        console.log("eamilAdd=" + emailAdd);
        this.initStatus=false;

        //get order info
            fetch(`https://${shopName}.myshopify.com/admin/api/2019-04/orders.json?name=${orderNum}&status=any`, {
                //mode: 'no-cors',
                method: 'GET',

            })
            .then(response => response.json())
            .then(resData=>{
                //check if order name exsits and the email address match
                if(JSON.stringify(resData.orders)!="[]"  //check order number exsit or not
                //&&resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase()    //check email address match or not
                ){
                    this.setState({
                        items:resData.orders[0].line_items.map(item=>{
                            return {
                                variantID:item.variant_id,
                                productID: item.product_id,
                                name: item.name,
                                quantity: item.quantity,
                                //returnQuantity: '0'
                            }
                        }),
                        searchStatus : true
                    })
                 
                }else{
                        this.setState({
                            searchStatus: false
                        })              
                }
            })
		
    }
    


	render() {
        if(!this.state.searchStatus&&this.initStatus){
		return (
			<div>
	 		<h1>{shopName}</h1>
	  			<Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
			</div>
        );
        }else if(!this.initStatus&&!this.state.searchStatus){
            return (
                <div>
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