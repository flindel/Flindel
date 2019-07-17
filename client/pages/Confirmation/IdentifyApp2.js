import React, { Component } from 'react';
import Search from './findOrder';
import ItemList from './itemSelect';
import ConfirmationPage from './showConfirmation'
import CheckPage from './reasonSelect'
import PickupInfo from './mapDisplay'
import NB from './navbar.js'
import PriceDisplay from './finalConfirmation.js'
import Review from './reviewRestart'
import '@shopify/polaris/styles.css';
const serveoname = 'optimo.serveo.net';
//const serveoname = 'facilis.serveo.net';
class IdentifyApp extends Component {
    //constructor and binding methods
    constructor(props){
		super(props);
		this.state = {
            items:[],
            existReturn:false, //check db to see if a return is existed or not
            searchStatus: false, //whether the login was successful (matching order and password)
            checkStatus:false, //proceed from item select page and show checkover page
            priceStatus: false, //proceed from checkover page and show pricing page
            submitStatus: false, //proceed from pricing page and show final page
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
        this.setState = this.setState.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.checkOver = this.checkOver.bind(this)
        this.setReturnList = this.setReturnList.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
        this.finishPricing = this.finishPricing.bind(this)
        this.setReason = this.setReason.bind(this)
        this.restart = this.restart.bind(this)
        this.viewPage2 = this.viewPage2.bind(this)
        this.viewPage3 = this.viewPage3.bind(this)
        this.viewPage4 = this.viewPage4.bind(this)
        this.checkReturnsFromDB = this.checkReturnsFromDB.bind(this)
        this.restartReturn = this.restartReturn.bind(this)
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
    viewPage2(){
        this.setState({step:2})
    }
    viewPage3(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = '---'
        }
        this.setState({step:3})
    }
    viewPage4(){
        this.setState({step:4})
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

    //move forward from checkover page to pricing page
    forward(){
        for (var i =0;i<this.returnItemList.length;i++){
            this.returnItemList[i].reason = ''
        }
        this.setState({step:4})
    }

    //move forward from pricing page to final page
    async finishPricing(){
        
        let tempList = this.state.returnlist
        for (var i = 0;i<tempList.length;i++){
            let curr = tempList[i]
            if(curr.value > 1){
                let temp = curr.value
                tempList[i].value = 1
                for (var j = 0;j<(temp-1);j++){
                    tempList.push(tempList[i])
                }
            }
        }
        await this.setState({returnlist:tempList})
        await this.generateID()
        await this.sendToDB()
        //this.sendEmail()
        this.setState({step:5})
    }

    restart(){
        this.setState({items:[],
            existReturn:false, //whether the return is existed in database
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
        fetch(`https://${serveoname}/dbcall?location=${encodeURIComponent('requestedReturns')}&method=${encodeURIComponent(1)}&date=${encodeURIComponent(currentDate)}&code=${encodeURIComponent(this.state.code)}&orderNum=${encodeURIComponent(this.state.orderNum)}&email=${encodeURIComponent(this.state.email)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
    }

    //set email from a manual entry from the checkover page
    setEmail(){
        let temp = this.state.newEmail.toLowerCase()
        this.state.email=temp
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


    async checkReturnsFromDB(orderNum,emailAdd){
        orderNum = 1
        let temp = await fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(4)}&orderNum=${encodeURIComponent(orderNum)}&emailAdd=${encodeURIComponent(emailAdd)}`, {
            method: 'get',
        })
        let json = await temp.json()
        if(json.exist){
            const returnInfo = {'code':json.code,
                                'email': emailAdd,
                                'orderNum': orderNum,}
            return returnInfo
         }
         else{ return false }
    }

    async restartReturn(orderNum, emailAdd, code){
        
        // call database change order_status
        let temp = await fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(8)}&code=${encodeURIComponent(this.state.code)}`, {
            method: 'get',
        })
        let json = await temp.json()
        if(json.success){
            //restart return process
            this.setState({
                existReturn:false
            })
            await this.identifyItems(orderNum, emailAdd, false)//false means function will not check database, but directly show itemlist
            
        }
    
    }
    
    //process of selecting whether order is valid
    async identifyItems(orderNum, emailAdd, checkDB){
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
        let temp = await fetch(`https://${serveoname}/orders?orderNum=${encodeURIComponent(data.orderNumber)}`, {
            method: 'GET',

        })
        let resData = await temp.json()
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
                if (diffDays<=100){////////////////////////////////////////////////////IMPORT SOME STUFF HERE ///////check all restrictions here!!!!
                    //check to see whether the email or phone number entered matches the one on record
                    if ((resData.orders[0].email.toLowerCase()==emailAdd.toLowerCase()) || (resData.orders[0].phone == phoneNum))
                    {
                        //if correct
                        //if pass checkDB
                        let returnInfo = false
                        if(checkDB){
                          returnInfo = await this.checkReturnsFromDB(data.orderNumber, data.emailAddress)
                        }
                            if(returnInfo){
                                this.setState({
                                    'code':returnInfo.code,
                                    'email': returnInfo.email,
                                    'orderNum': returnInfo.orderNum,
                                    'existReturn': true
                                })
                            }else{
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
    }
    
    /*
    Conditional render/mainline
    All steps call a subpage based on the state variables on which page to show
    */
	render() {
        if(this.state.step == 1){
            if(this.state.existReturn){
                return (
                    <div>
                       <NB
                    
                    //    viewMaps ={this.viewMaps.bind(this)}
                    //    unviewMaps = {this.unviewMaps.bind(this)} 
                     
                       shopName = {this.state.shopName}/>
                       <Review code={this.state.code} email = {this.state.email} orderNum = {this.state.orderNum} restartReturn = {this.restartReturn}/>
                       <p>{JSON.stringify(this.state)}</p>
                   </div>
                )
               }
		return (
			<div>
            <NB
            step1={'active'}
            step2={''}
            step3={''}
            show = {false}
            shopName = {this.state.shopName}/>
            <p className = 'errorMessage'>{this.state.errorMessage}</p>
	  			<Search identifyCustomerID={this.identifyCustomerID} identifyItems={this.identifyItems} />
			</div>
        );
        }else if (!this.state.existReturn && this.state.step==2) {
           return (
               <div>
                <NB
                step1={'live'}
                step2={''}
                step3={''}
                show = {true}
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
                step1={'active'}
                step2={'live'}
                step3={''}
                show = {true}
                viewPage2 = {this.viewPage2.bind(this)}
                shopName = {this.state.shopName}/> 
                <CheckPage
                serveoname = {serveoname}
                setReason = {this.setReason.bind(this)}
                items={this.returnItemList}
                email = {this.state.email} 
                selectedEmail={this.state.selectedEmail} 
                newEmail={this.state.newEmail} 
                orderNum = {this.state.orderNum}
                updateforward={this.forward.bind(this)}
                updateEmail = {this.setEmail.bind(this)}
                updatehandleChange = {this.handleChange.bind(this)}/>
                </div>
            )
        }
        else if (this.state.step==4){
            return(
                <div>
                <NB
                step1={'active'}
                step2={'active'}
                step3={'live'}
                show = {true}
                viewPage2 = {this.viewPage2.bind(this)}
                viewPage3 = {this.viewPage3.bind(this)}
                shopName = {this.state.shopName}/> 
                <PriceDisplay
                serveoname={serveoname}
                items = {this.state.returnlist}
                orderNum = {this.state.orderNum}
                finishPricing = {this.finishPricing.bind(this)}/>
                </div>
            )
        }
        else if (this.state.step==5){
            return(
                <div>
                <NB
                step1={'active'}
                step2={''}
                step3={''}
                show = {false}
                shopName = {this.state.shopName}/> 
                <ConfirmationPage
                serveoname = {serveoname}
                code = {this.state.code} 
                email = {this.state.email}/>
                <br/><br/><br/>
                <PickupInfo/>
                </div>
            )
        }
	}
}

export default IdentifyApp;