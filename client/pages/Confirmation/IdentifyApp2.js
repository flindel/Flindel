import React, { Component } from 'react';
import Search from './findOrder';
import ItemList from './itemSelect';
import ConfirmationPage from './showConfirmation'
import CheckPage from './reasonSelect'
import PickupInfo from './mapDisplay'
import NB from './navbar.js'
import PriceDisplay from './finalConfirmation.js'
import {Card, AppProvider, Button, ProgressBar} from '@shopify/polaris';
const serveoname = 'optimu.serveo.net';
let shopName = ''
const myStyle = {
    color: 'red',
    textAlign: 'center'
}
class IdentifyApp extends Component {
    //constructor and binding methods
    constructor(props){
		super(props);
		this.state = {
            items:[],
            step: 1,
            code: '',
            email: '', 
            newEmail: '',
            returnlist: [],
            shopName:'',
            orderNum:'',
            errorMessage:'',
        };
        this.returnItemList= []
        this.identifyItems=this.identifyItems.bind(this) 
        this.forward = this.forward.bind(this)
        this.back = this.back.bind(this)
        this.setState = this.setState.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.checkOver = this.checkOver.bind(this)
        this.setReturnList = this.setReturnList.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
        this.finishPricing = this.finishPricing.bind(this)
        this.pricingBack = this.pricingBack.bind(this)
        this.setReason = this.setReason.bind(this)
        this.restart = this.restart.bind(this)
    }

    //generate usable unique codes
    async generateID(){
        //alphabet, vowels removed for censoring
        const alphabet = "BCDFGHJKLMNPQRSTVWXZ123456789";
        const codeLength = 6;
        let code = "";
        for (var i = 0;i<codeLength;i++)
          {
            let index = Math.floor((Math.random() * alphabet.length));
            code += alphabet[index]
            //search here instead of manually setting
          }
          //set state to the new code
          await this.setState({code:code})
          let unique =  await this.checkUnique()
          if(unique == false){
              this.generateID() 
          }
    }

    /* This sets the reason for items return. the data only passes correctly if both lists are used */
    async setReason(varID, reason, oldreason){
        let count = 0;
        let found = false;
        //change reason (copy over to master)
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
        //copy over to return list
        await this.setState({returnlist:[]})
        for (var i = 0;i<this.returnItemList.length;i++){
            let temp = this.returnItemList[i]
            let tjs = JSON.stringify(temp)
            let newobj = JSON.parse(tjs)
            let tempArray = this.state.returnlist
            tempArray.push(newobj)
            this.setState({returnlist:tempArray}) 
        }
    }

    //proceed to checkover page from select page if item is selected
    checkOver(){
        if(this.returnItemList.length>0){
            this.setState({step:3})
        }
    }

    //move back from pricing page to checkover page
    pricingBack(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = '---'
        }
        this.setState({step:3})
    }

    //move forward from checkover page to pricing page
    forward(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = ''
        }
        this.setState({step:4})
    }

    //move forward from pricing page to final page
    async finishPricing(){
        await this.generateID()
        await this.sendToDB()
        //this.sendEmail()
        this.setState({step:5})
    }

    restart(){
        this.setState({items:[],
            searchStatus: false, //whether the login was successful (matching order and password)
            checkStatus:false, //proceed from item select page and show checkover page
            priceStatus: false, //proceed from checkover page and show pricing page
            submitStatus: false, //proceed from pricing page and show final page
            code: '',
            email: '', 
            newEmail: '',
            mapView: 0, //used to show navbar option
            returnlist: [],
            shopName:'',
            orderNum:'',
            errorMessage:'',})
            this.returnItemList = [];
    }

    //send email, calls backend function
    sendEmail(){
        fetch(`https://${serveoname}/send?method=${encodeURIComponent(1)}&email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.code)}`, 
        {
            method: 'post',
        })
       }

    //check if code is unique (call to db)
    async checkUnique(){
        let temp = await fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(3)}&code=${encodeURIComponent(this.state.code)}`, {
            method: 'get',
        })
        let json = await temp.json()
        return json.unique
    }

    //send information to firestore db
    sendToDB(){
        let currentDate = ''
        currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
        let items = JSON.stringify(this.state.returnlist)
        //1 for write, 2 for read
        fetch(`https://${serveoname}/dbcall?location=${encodeURIComponent('returns')}&method=${encodeURIComponent(1)}&date=${encodeURIComponent(currentDate)}&code=${encodeURIComponent(this.state.code)}&orderNum=${encodeURIComponent(this.state.orderNum)}&email=${encodeURIComponent(this.state.email)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
    }

    //set email from a manual entry from the checkover page
    setEmail(){
        let temp = this.state.newEmail.toLowerCase()
        this.state.email=temp
    }

    //move back from selection page
    back(){
        this.setState({step:2})
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
        this.returnItemList = []
        for (var i =0;i<listIn.length;i++){
            let tempItem = {
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
        let phoneNum = '+1';
        phoneNum += emailAdd;
        for (var i = 0;i<phoneNum.length;i++){
            //ignoring characters that people use to enter their phone number
            if (phoneNum[i]==' ' || phoneNum[i]=='-' || phoneNum[i]=='('||phoneNum[i]==')'){
                phoneNum = phoneNum.substring(0,i)+phoneNum.substring(i+1)
            }
        }
        this.setState({email:emailAdd.toLowerCase()})
        const data = {orderNumber: orderNum, emailAddress:emailAdd};
        //get order info
        fetch(`https://${serveoname}/orders?orderNum=${encodeURIComponent(data.orderNumber)}`, {
                method: 'GET',

            })
            //get data on the selected order from backenid
            .then(response => response.json())
            .then(resData=>{
                if(JSON.stringify(resData.orders)!="[]")
                {
                //get date difference:
                let dateString = resData.orders[0].processed_at
                let orderDate =  ''
                orderDate+= dateString.substring(5,7)+'/'+dateString.substring(8,10)+'/'+dateString.substring(0,4)
                let currentDate = ''
                currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
                const date2 = new Date(dateString)
                const date1 = new Date(currentDate)
                const diffTime = Math.abs(date2.getTime() - date1.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays<=100){////////////////////////////////////////////////////IMPORT SOME STUFF HERE
                    //check to see whether the email or phone number entered matches the one on record
                    if ((resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase()) || (resData.orders[0].phone == phoneNum))
                    {
                        //if correct
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
                            step:2,
                            orderNum: orderNum
                        })
                    }
                    else {
                        //show they made an incorrect attempt  
                            this.setState({
                                errorMessage:"The order number, email, or phone number you entered didn't match our records."
                            })      
                    }
                    }
                else{
                    this.setState({
                        errorMessage: "Your order is past store return policy and is no longer eligible for return."
                    }) 
                }
                }
                else{   
                    this.setState({
                    errorMessage:"The order number, email, or phone number you entered didn't match our records."
                    })
                }
            }) 
    }

    
    /*
    Conditional render/mainline
    All steps call a subpage based on the state variables on which page to show
    */
	render() {
        if(this.state.step == 1){
		return (
			<div>
            <NB
            shopName = {this.state.shopName}/>
            <p style = {myStyle}>{this.state.errorMessage}</p>
	  			<Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
			</div>
        );
        }else if (this.state.step==2) {
           return (
               <div>
                <NB
                shopName = {this.state.shopName}/> 
               <ItemList 
               serveoname = {serveoname}
               orderNum = {this.state.orderNum}
               handleSubmit = {this.checkOver.bind(this)}
               setReturnList = {this.setReturnList.bind(this)}
               items={this.state.items}/> 
               </div>
               ) 
        } else if (this.state.step==3){
            return(
                <div>
                <NB
                shopName = {this.state.shopName}/> 
                <CheckPage
                serveoname = {serveoname}
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
        else if (this.state.step==4){
            return(
                <div>
                <NB
                shopName = {this.state.shopName}/> 
                <PriceDisplay
                serveoname={serveoname}
                items = {this.state.returnlist}
                orderNum = {this.state.orderNum}
                finishPricing = {this.finishPricing.bind(this)}
                pricingBack = {this.pricingBack.bind(this)}/>
                </div>
            )
        }
        else if (this.state.step==5){
            return(
                <div>
                <NB
                shopName = {this.state.shopName}/> 
                <ConfirmationPage
                serveoname = {serveoname}
                code = {this.state.code} 
                email = {this.state.email} 
                shopName = {shopName}/>
                <br/><br/><br/>
                <PickupInfo/>
                </div>
            )
        }
	}
}

export default IdentifyApp;