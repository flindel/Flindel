import React, { Component } from 'react';
import Search from './Search2';
import ItemList from './ItemList2';
import ConfirmationPage from './showConfirmation'
import CheckPage from './confirmOrder'
import PickupInfo from './mapDisplay'
import NB from './navbar.js'
import PriceDisplay from './priceDisplay.js'
const shopName="getOrderTest";
const serveoname = 'campana';

class IdentifyApp extends Component {
    //constructor and binding methods
    constructor(props){
		super(props);
		this.state = {
            items:[],
            searchStatus: false, //whether the login was successful (matching order and password)
            checkStatus:false, //proceed from item select page and show checkover page
            priceStatus: false, //proceed from checkover page and show pricing page
            submitStatus: false, //proceed from pricing page and show final page
            code: '',
            email: '', 
            newEmail: '',
            mapView: 0, //used to show navbar option
            returnlist: []
        };
        this.returnItemList= []
        this.initStatus= true  // whether a login attempt has been made. Used for conditional render
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
        this.finishPricing = this.finishPricing.bind(this)
        this.pricingBack = this.pricingBack.bind(this)
        this.setReason = this.setReason.bind(this)
    }

    //generate usable unique codes
    async generateID(){
        //alphabet, vowels removed for censoring
        var alphabet = "BCDFGHJKLMNPQRSTVWXZ0123456789";
        var codeLength = 6;
        var index;
        var code = "";
        var unique;
        for (var i = 0;i<codeLength;i++)
          {
            index = Math.floor((Math.random() * alphabet.length));
            code += alphabet[index]
            //search here instead of manually setting
          }
          //set state to the new code
          await this.setState({code:code})
          unique =  await this.checkUnique()
          if(unique == false){
              this.generateID() 
          }
    }
    /* This sets the reason for items return. the data only passes correctly if both lists are used */
    async setReason(varID, reason, oldreason){
        var count = 0;
        var found = false;
        while (count < this.returnItemList.length && found == false){
            let temp = this.returnItemList[count]
            if (varID == temp.variantid && temp.reason==oldreason&&found == false){
                this.returnItemList[count].reason = reason
                found = true
            }
            else{
                count+=1
            }
        }
        await this.setState({returnlist:[]})
        for (var i = 0;i<this.returnItemList.length;i++){
            var temp = this.returnItemList[i]
            var tjs = JSON.stringify(temp)
            var newobj = JSON.parse(tjs)
            var tempArray = this.state.returnlist
            tempArray.push(newobj)
            this.setState({returnlist:tempArray}) 
        }
    }

    //proceed to checkover page from select page if item is selected
    checkOver(){
        if(this.returnItemList.length>0){
            this.setState({checkStatus:true})
        }
    }

    //move back from pricing page to checkover page
    pricingBack(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = ''
        }
        this.setState({priceStatus:false})
    }

    //move forward from checkover page to pricing page
    forward(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = ''
        }
        this.setState({priceStatus: true})
    }

    //move forward from pricing page to final page
    async finishPricing(){
        await this.generateID()
        await this.sendToDB()
        //this.sendEmail()
        this.setState({submitStatus: true})
    }

    //send email, calls backend function
    sendEmail(){
        fetch(`https://${serveoname}.serveo.net/send?email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.code)}`, 
        {
            method: 'post',
        })
       }

    async checkUnique(){
        var temp
        //1:write return
        //2: check single return (not useful rn)
        //3: check all returns for UID
        //4: write item
        temp = await fetch(`https://${serveoname}.serveo.net/dbcall?method=${encodeURIComponent(3)}&code=${encodeURIComponent(this.state.code)}`, {
            method: 'get',
        })
        var json = await temp.json()
        return json.unique
    }

    //send information to firestore db
    sendToDB(){
        let items = JSON.stringify(this.state.returnlist)
        //1 for write, 2 for read
        fetch(`https://${serveoname}.serveo.net/dbcall?method=${encodeURIComponent(1)}&code=${encodeURIComponent(this.state.code)}&email=${encodeURIComponent(this.state.email)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
    }

    //set email from a manual entry from the checkover page
    setEmail(){
        var temp = this.state.newEmail
        this.state.email=temp
    }

    //move back from selection page
    back(){
        this.setState({checkStatus: false,searchStatus:true})
        this.initStatus=false
    }

    //on navbar, views the map page
    viewMaps(){
        this.setState({mapView:1})
    }

    //on navbar, goes back from nav page to main flow
    unviewMaps(){
        this.setState({mapView: 0})
    }

    //handle change to state variable
    handleChange(inp) {
        return function (e) {
          var state = {};
          state[inp] = e.target.value;
          this.setState(state);
          this.setState({}) 
        }.bind(this); 
      }

    //set return list (have to recreate items as form of deep copy)
    setReturnList(listIn){
        for (var i =0;i<listIn.length;i++){
            var tempItem = {
                productID: listIn[i].productID,
                variantid:listIn[i].variantid,
                name:listIn[i].name,
                value:listIn[i].value,
                quantity:listIn[i].quantity,
                reason:listIn[i].reason,
                src:listIn[i].src,
                price:listIn[i].price,
            }
            this.returnItemList.push(tempItem)
        }
      }

    //process of selecting whether order is valid
	identifyItems(orderNum, emailAdd){
        //matching phone number to shopify style
        var phoneNum = '+1';
        phoneNum += emailAdd;
        for (var i = 0;i<phoneNum.length;i++){
            //ignoring characters that people use to enter their phone number
            if (phoneNum[i]==' ' || phoneNum[i]=='-' || phoneNum[i]=='('||phoneNum[i]==')'){
                phoneNum = phoneNum.substring(0,i)+phoneNum.substring(i+1)
            }
        }
        this.setState({email:emailAdd})
        const data = {orderNumber: orderNum, emailAddress:emailAdd};
        //get order info
        fetch(`https://${serveoname}.serveo.net/orders?orderNum=${encodeURIComponent(data.orderNumber)}`, {
                method: 'GET',

            })
            //get data on the selected order from backenid
            .then(response => response.json())
            .then(resData=>{
                //check if order exists based on its number
                if(JSON.stringify(resData.orders)!="[]")
                {
                //check to see whether the email or phone number entered matches the one on record
                if ((resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase()) || (resData.orders[0].phone == phoneNum))
                {
                    //if correct
                    this.initStatus=false;
                    this.setState({
                        //set the items var to the items in the order
                        items:resData.orders[0].line_items.map(item=>{
                            return {
                                variantID:item.variant_id,
                                productID: item.product_id,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                            }
                        }),
                        //set searchstatus to true to move forward
                        searchStatus : true
                    })
                }
                else {
                    //show they made an incorrect attempt
                    this.initStatus=false;     
                        this.setState({
                            searchStatus: false
                        })      
                }
                } 
            }) 
		
    }
    

    /*
    Conditional render/mainline
    All steps call a subpage based on the state variables on which page to show
    */
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
        } else if (this.state.checkStatus&&!this.state.priceStatus&&!this.state.mapView){
            return(
                <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}    
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
                <CheckPage
                setReason = {this.setReason.bind(this)}
                items={this.returnItemList}
                shopName = {shopName}
                email = {this.state.email} 
                selectedEmail={this.state.selectedEmail} 
                newEmail={this.state.newEmail} 
                orderNum = {this.state.orderNum}
                updateforward={this.forward.bind(this)}
                updateEmail = {this.setEmail.bind(this)}
                updateback = {this.back.bind(this)}
                updatehandleChange = {this.handleChange.bind(this)}/>
                </div>
            )
        }
        else if (this.state.priceStatus&&!this.state.submitStatus&&!this.state.mapView){
            return(
                <div>
                <NB
                viewMaps ={this.viewMaps.bind(this)}
                unviewMaps = {this.unviewMaps.bind(this)}
                shopName = {shopName}/> 
                <PriceDisplay
                items = {this.returnItemList}
                finishPricing = {this.finishPricing.bind(this)}
                pricingBack = {this.pricingBack.bind(this)}/>
                </div>
            )
        }
        else if (this.state.submitStatus&&!this.state.mapView){
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
                <br/><br/><br/>
                <PickupInfo/>
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