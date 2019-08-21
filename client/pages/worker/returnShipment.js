import React, { Component } from 'react';
import '../Confirmation/universal.css'
import './flindelInterface.css'
import {serveo_name} from '../config'
import Item from './itemSC'
const sname = serveo_name
const serveoname = sname.substring(8)

class returnShipment extends Component {
    constructor(props){
        super(props);
        this.state = {
            step: 1,
            store: '',
            items: [],
            returnList:[],
            start: true
        }
        this.goBeginning = this.goBeginning.bind(this)
        this.selectItems = this.selectItems.bind(this)
        this.handleStoreSelect = this.handleStoreSelect.bind(this)
        this.handleQuantityChange = this.handleQuantityChange.bind(this)
        this.goConfirmation = this.goConfirmation.bind(this)
        this.confirmReturn = this.confirmReturn.bind(this)
        this.sendEmails = this.sendEmails.bind(this)
        this.updateDB = this.updateDB.bind(this)
    }
    //go back to beinning
    goBeginning(){
        this.setState({step:1, store: ''})
    }

    //go to confirmation page
    goConfirmation(){
        let tempList = this.state.items
        let returnList = []
        let valid = true
        //make sure all quantities are valid
        for (var i =0;i<tempList.length;i++){
            if (tempList[i].value > tempList[i].quantity){
                valid = false
            }
            if (tempList[i].value > 0){
                returnList.push(tempList[i])
            }
        }
        if (valid){
            //make sure something was selected
            if (returnList.length!=0){
                this.setState({step:3, returnList: returnList})
            }
            else{
                //error message
                alert('Cannot proceed with an empty list')
            }
        }
        else{
            //error message
            alert('You cannot return more items than are in the warehouse. Please check again')
        }
    }

    //after store is selected, continue
    selectItems(){
        if (this.state.store != ''){
            if (this.state.start){
                this.loadItems()
                this.setState({start:false})
            }
            this.setState({step:2,})
        }
    }
    //when entire return is confirmed
    confirmReturn(){
        this.sendEmails()
        this.updateDB()
        this.setState({step:4})
    }

    sendEmails(){
        //send email to flindel and brand about items
        let itemString = JSON.stringify(this.state.returnList)
        fetch(`https://${serveoname}/send/returnShipment?store=${encodeURIComponent(this.state.store)}&items=${encodeURIComponent(itemString)}`, {
            method: 'post',
        })
    }

    updateDB(){
        //update items in db from returning to returned
        for (var i = 0;i<this.state.returnList.length;i++){
            let tempItem = this.state.returnList[i]
            let qty = tempItem.value
            let id = tempItem.variantid
            fetch(`https://${serveoname}/item/returned?quantity=${encodeURIComponent(qty)}&store=${encodeURIComponent(this.state.store)}&id=${encodeURIComponent(id)}`, {
            method: 'put',
            })
        }
    }

    //change store from dropdown menu
    handleStoreSelect(e){
        this.setState({store:e.target.value})
    }

    //change quantity of returning (parent fn)
    handleQuantityChange(index,numIn){
        let tempList = this.state.items
        if (numIn == ''){
            tempList[index].value = numIn
        }
        //make sure it is an integer with regex
        else if (numIn.toString()[numIn.toString().length-1].match("-?(0|[1-9]\\d*)")){
            tempList[index].value = numIn
        }
        this.setState({items:tempList})
    }

    //load items when store is selected
    async loadItems(){
        let temp = await fetch(`https://${serveoname}/item/storeList/?store=${encodeURIComponent(this.state.store)}`, {
            method: 'get',
        })
        let items = await temp.json()
        for (var i = 0;i<items.length;i++){
            for (var j = i+1;j<items.length;j++){
                //combine quantities so there are no duplicates
                if (items[i].variantid == items[j].variantid){
                    items[i].quantity++
                    items.splice(j,1)
                    j--
                }
            }
        }
        for (var i =0;i<items.length;i++){
            items[i].index = i
            items[i].productid = items[i].productID
        }
        this.setState({items:items})
        console.log(items)
    }

    //conditional render - step1 for enter store, step2 for doing stuff
    render() {
        if(this.state.step == 1){
            return(
                <div>
                    <h1 className = 'scHeader'>RETURN SHIPMENT</h1>
                    <br/>
                    <h4>Please select desired store from the list below.</h4>
                    <br/>
                    <select value={this.state.store} onChange={this.handleStoreSelect}>
                        <option value="">---</option>
                        <option value="getordertest.myshopify.com">GetOrderTest</option>
                        <option value="ds-test-yash-kini.myshopify.com">DS Test Yash Kini</option>
                        <option value="flindel-demo-1.myshopify.com">Flindel Demo 1</option>
                    </select>
                    <button onClick = {this.selectItems}>SUBMIT</button>
                    <br/><br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 2){
            return(
                <div>
                    <h1 className = 'scHeader'>RETURN SHIPMENT</h1>
                    <br/>
                    <h4 className = 'scHeader'>Store: {this.state.store}</h4>
                    <br/><br/>
                    <fieldset className = 'Return'>
                    <div className = 'itemContainerSC'>
                            <div className ='containerReturnHeader'>
                                <p className = 'itemHeader'>IMAGE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='containerReturnHeader'>
                                <p className = 'itemHeader' > NAME  </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>VARIANT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>PRODUCT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>QUANTITIES</p>
                            </div>
                        </div>
                        {this.state.items.map((item)=>{
                            return <Item item={item} handleQuantityChange = {this.handleQuantityChange.bind(this)} serveoname = {serveoname} step = {6} key={item.variantid}/>
                        })}
                    </fieldset>
                    <br/><br/>
                    <button onClick = {this.goBeginning}>BACK</button>
                    <button onClick = {this.goConfirmation}>CONTINUE</button>
                </div>
            )
        }
        else if (this.state.step == 3){
            return(
                <div>
                    <h1 className = 'scHeader'>RETURN SHIPMENT</h1>
                    <br/>
                    <h4 className = 'scHeader'>Store: {this.state.store}</h4>
                    <br/>
                    <h4 className = 'scHeader'>Confirmation</h4>
                    <br/>
                    <fieldset className = 'Return'>
                    <div className = 'itemContainerSC'>
                            <div className ='containerReturnHeader'>
                                <p className = 'itemHeader'>IMAGE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='containerReturnHeader'>
                                <p className = 'itemHeader' > NAME  </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>VARIANT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>PRODUCT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'containerReturnHeader'>
                                <p className = 'itemHeader'>QTY RETURNING</p>
                            </div>
                        </div>
                        {this.state.returnList.map((item)=>{
                            return <Item item={item} handleQuantityChange = {this.handleQuantityChange.bind(this)} serveoname = {serveoname} step = {7} key={item.variantid}/>
                        })}
                    </fieldset>
                    <br/>
                    <button onClick = {this.selectItems}>BACK</button>
                    <button onClick = {this.confirmReturn}>CONFIRM</button>
                </div>
            )
        }
        else if (this.state.step == 4){
            return(
                <div>
                    <h1 className = 'scHeader'>RETURN SHIPMENT</h1>
                    <br/>
                    <h4 className = 'scHeader'>Store: {this.state.store}</h4>
                    <br/>
                    <p>This return has been confirmed and {this.state.store} has been notified of the shipment.</p>
                    <br/><br/>
                    <button onClick = {this.goBeginning}>HOME</button>
                </div>
            )
        }
    }
}

export default returnShipment;