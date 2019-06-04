import React, { Component } from 'react';
import Search from './Search2';
import ItemList from './ItemList2';
import ConfirmationPage from './showConfirmation'
import CheckPage from './confirmOrder'
import PickupInfo from './mapDisplay'
import NB from './navbar.js'

const shopName="getOrderTest";

class IdentifyApp extends Component {
    constructor(props){
		super(props);
		this.state = {
            items:[],
            searchStatus: false,
            checkStatus:false,
            submitStatus: false,
            code: '',
            email: '', 
            newEmail: '',
            mapView: 0,
        };
        this.returnItemList= []
        this.initStatus= true  // combine with searchStatus to control conditions for render
        this.identifyItems=this.identifyItems.bind(this) 
        this.forward = this.forward.bind(this)
        this.back = this.back.bind(this)
        this.setState = this.setState.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.checkOver = this.checkOver.bind(this)
        this.setReturnList = this.setReturnList.bind(this)
        this.viewMaps = this.viewMaps.bind(this)
        this.unviewMaps = this.unviewMaps.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
    }

    generateID(){
        var alphabet = "BCDFGHJKLMNPQRSTVWXZ0123456789";
        var codeLength = 6;
        var index;
        var code = "";
        for (var i = 0;i<codeLength;i++)
          {
            index = Math.floor((Math.random() * alphabet.length));
            code += alphabet[index]
            //search here instead of manually setting
          }
          this.setState({code:code})
    }

    checkOver(){
        if(this.returnItemList.length>0){
            this.setState({checkStatus:true})
        }
    }

    forward(){
        this.generateID()
        this.setState({submitStatus: true})
        this.sendEmail()
        this.sendToDB()
    }

    sendEmail(){
        fetch(`https://campana.serveo.net/send?email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.code)}`, 
        {
            method: 'POST',
          /*  headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },*/

        }).then(response => {alert('EMAIL SENT*')})
       }

    sendToDB(){
        //do something
    }

    setEmail(){
        var temp = this.state.newEmail
        this.state.email=temp
    }

    back(){
        this.setState({checkStatus: false,searchStatus:true})
        this.initStatus=false
    }

    viewMaps(){
        this.setState({mapView:1})
    }
    unviewMaps(){
        this.setState({mapView: 0})
    }

    handleChange(inp) {
        return function (e) {
          var state = {};
          state[inp] = e.target.value;
          this.setState(state);
          this.setState({}) 
        }.bind(this); 
      }

    setReturnList(newItem){
        this.returnItemList = newItem.slice();
      }

	identifyItems(orderNum, emailAdd){
        var phoneNum = '+1';
        phoneNum += emailAdd;
        for (var i = 0;i<phoneNum.length;i++){
            if (phoneNum[i]==' ' || phoneNum[i]=='-' || phoneNum[i]=='('||phoneNum[i]==')'){
                phoneNum = phoneNum.substring(0,i)+phoneNum.substring(i+1)
            }
        }
        this.setState({email:emailAdd})
        const data = {orderNumber: orderNum, emailAddress:emailAdd};
        //get order info
        fetch(`https://campana.serveo.net/orders?orderNum=${encodeURIComponent(data.orderNumber)}`, {
                //mode: 'no-cors',
                method: 'GET',

            })
            .then(response => response.json())
            .then(resData=>{
                //check if order name exsits and the email address or phone number match
                if(JSON.stringify(resData.orders)!="[]")
                {
                if ((resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase()) || (resData.orders[0].phone == phoneNum))  //check email address match or not
                {
                    this.initStatus=false;
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
                }
                else {
                    this.initStatus=false;     
                        this.setState({
                            searchStatus: false
                        })      
                }
                } 
            }) 
		
    }
    


	render() {
        if(!this.state.searchStatus&&this.initStatus&&!this.state.checkStatus&&!this.state.mapView){
		return (
			<div>
            <NB
            viewMaps ={this.viewMaps.bind(this)}
            unviewMaps = {this.unviewMaps.bind(this)} 
            shopName = {shopName}/>
	  			<Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
			</div>
        );
        }else if(!this.initStatus&&!this.state.searchStatus&&!this.state.checkStatus&&!this.state.mapView){
            return (
                <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
                      <Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
                      <p>Order not found!</p>
                </div>
            );
        }else if (this.state.searchStatus&&!this.initStatus&&!this.state.checkStatus&&!this.state.mapView) {
           return (
               <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
               <ItemList 
               handleSubmit = {this.checkOver.bind(this)}
               setReturnList = {this.setReturnList.bind(this)}
               items={this.state.items}/> 
               </div>
               ) 
        } else if (this.state.checkStatus&&!this.state.submitStatus&&!this.state.mapView){
            return(
                <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
                <CheckPage
                items={this.returnItemList}
                shopName = {shopName}
                email = {this.state.email} 
                selectedEmail={this.state.selectedEmail} 
                newEmail={this.state.newEmail} 
                orderNum = {this.state.orderNum}
                updateforward={this.forward.bind(this)}
                updateEmail = {this.setEmail.bind(this)}
                updateback = {this.back.bind(this)}
                updatehandleChange = {this.handleChange.bind(this,'newEmail')}/>
                </div>
            )
        }else if (this.state.submitStatus&&!this.state.mapView&&this.returnItemList.length>0){
            return(
                <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
                <ConfirmationPage
                code = {this.state.code} 
                email = {this.state.email} 
                shopName = {shopName}/>
                </div>
            )
        }
        else if (this.state.mapView){
            return(
            <div>
            <NB
            shopName = {shopName}
            viewMaps ={this.viewMaps.bind(this)}
            unviewMaps = {this.unviewMaps.bind(this)}/>     
            <PickupInfo/>
            </div>
            )
        }
	}
}

export default IdentifyApp;