import React, {Component} from 'react';
import Item from '../Confirmation/Item2'
import Blacklist from './blacklistUniversal'
import {serveo_name} from '../config'
import './sorting.css'
const sname = serveo_name
const serveoname = sname.substring(8)

/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class sortingCentre extends Component{
    constructor(props){
        super(props);
        this.state={
            cCode:'',
            step: 1,
            itemList: [],
            email: '',
            emailOriginal: '',
            orderNum:'',
            createdDate:'',
            confirmList:[],
            store:'',
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handlecCode = this.handlecCode.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this)
        this.handleSubmit2 = this.handleSubmit2.bind(this)
        this.resetAll = this.resetAll.bind(this)
        this.finalCheck = this.finalCheck.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
        this.dailyConfirm = this.dailyConfirm.bind(this)
        this.loadConfirmList = this.loadConfirmList.bind(this)
        this.addItem = this.addItem.bind(this)
        this.setOpenTime = this.setOpenTime.bind(this)
        this.setCloseTime = this.setCloseTime.bind(this)
    }

    setOpenTime(){
        fetch(`https://${serveoname}/return/requested/openTime?code=${encodeURIComponent(this.state.cCode)}`, 
        {
            method: 'PUT',
        })
    }

    setCloseTime(){
        fetch(`https://${serveoname}/return/requested/closeTime?code=${encodeURIComponent(this.state.cCode)}`, 
        {
            method: 'PUT',
        })
    }

    addItem(newItem, oldItem){
        let tempList = this.state.itemList
        for (var i = 0;i<tempList.length;i++){
            if (oldItem == tempList[i]){
                tempList[i].flag = '-1'
            }
        }
        tempList.push(newItem)
        for (var j = 0;j<tempList.length;j++){
            for (var i = 0;i<tempList.length -1;i++){
                if (tempList[i].flag == -1 && tempList[i+1]!= -1){
                    let tempItem = tempList[i]
                    tempList[i] = tempList[i+1]
                    tempList[i+1] = tempItem
                }
            }
        }
        this.setState({itemList:tempList})
    }

    async dailyConfirm(){
        this.setState({step:5})
        await this.loadConfirmList()
    }

    async loadConfirmList(){
        let items = await fetch(`https://${serveoname}/return/pending/itemList`, 
        {
            method: 'get',
        })
        let itemList = []
        let itemsJSON = await items.json()
        for (var i = 0;i<itemsJSON.length;i++){
            let tempItem = {
                variantid:itemsJSON[i].variantid.stringValue,
                productid: itemsJSON[i].productid.stringValue,
                quantity: 1,
                name: itemsJSON[i].name.stringValue,
                store: itemsJSON[i].store,
                value: 0
            }
            itemList.push(tempItem)
        }
        for (var i = 0;i<itemList.length;i++){
            for (var j = i+1;j<itemList.length;j++){
                if (itemList[i].variantid == itemList[j].variantid && itemList[i].store == itemList[j].store){
                    itemList[i].quantity++
                    itemList.splice(j,1)
                    j--
                }
            }
        }
        await this.setState({confirmList:itemList})
    }

    //accept initial input
    handlecCode(e){
        this.setState({cCode:e.target.value})
    }

    //start from beginning (shows at end so you don't have to refresh)
    resetAll(){
        this.setState({cCode:'',
        step: 1,
        itemList: []})
    }

    //send email
    async sendEmail(){
        let rejectList = []
        let acceptList = []
        for (var i = 0;i<this.state.itemList.length;i++){
            let temp = this.state.itemList[i]
            if((temp.status == 'accepted' || temp.status == 'returning')&& (temp.flag =='-1' || temp.flag == '0')){
                acceptList.push(temp)
            }
            else if (temp.status == 'rejected' && (temp.flag == '-1' || temp.flag == '0')){
                rejectList.push(temp)
            }
        }
        let RL = await JSON.stringify(rejectList)
        let AL = await JSON.stringify(acceptList)
        fetch(`https://${serveoname}/send/update?rejectList=${encodeURIComponent(RL)}&acceptList=${encodeURIComponent(AL)}&email=${encodeURIComponent(this.state.email)}`, 
        {
            method: 'post',
        })
    }
    
    //write to db
    async sendToDB(){
        let currentDate = ''
        let items = JSON.stringify(this.state.itemList)
        //write to pending + history, delete from reqReturns, all one transaction
        await fetch(`https://${serveoname}/return/pending/new?code=${encodeURIComponent(this.state.cCode)}`, {
            method: 'post',
        })
    }
    //send see if anything has been changed, make sure all items have been dealt with before moving
    finalCheck(){
        let found = false
        let count = 0
        while(count<this.state.itemList.length && found == false){
            let temp = this.state.itemList[count]
            if (temp.status == 'submitted'){
                found = true
            }
            count ++
        }
        //make sure all items in order have been dealt with
        if (!found){
            this.sendEmail()
            this.sendToDB()
        }
    }

    //handle changing status
    handleReasonChange(varID, status, oldstatus){
        let count = 0
        let found = false
        let tempList = this.state.itemList
        while (count < tempList.length && found == false){
            let temp = tempList[count]
            if (varID == temp.variantid && temp.status==oldstatus&&found == false){
                tempList[count].status = status
                found = true
            }
            else{
                count+=1
            }
        }
        this.setState({itemList:tempList})
    }

    handleQuantityChange(numIn, varID){
        let tempList = this.state.confirmList
        for (var i =0;i<tempList.length;i++){
            if (varID == tempList[i].variantid){
                if (numIn == ''){
                    tempList[i].value = numIn
                }
                else if (numIn.match("-?(0|[1-9]\\d*)")){
                    tempList[i].value = parseInt(numIn)
                }
            }
        }
        this.setState({confirmList:tempList})
    }

    //submit the changing of reasons, finish process and send to db
    async handleSubmit2(){
        this.setCloseTime()
        let items = await JSON.stringify(this.state.itemList)
        //update new reasons
        fetch(`https://${serveoname}/return/requested/itemStatus?code=${encodeURIComponent(this.state.cCode)}&items=${encodeURIComponent(items)}`, {
            method: 'PUT',
        })
        this.setState({step:4})
        this.finalCheck()
    }

    //handle initial submit, load items for order
    async handleSubmit(){
        let temp = await fetch(`https://${serveoname}/return/requested/items?code=${encodeURIComponent(this.state.cCode)}`, {
            method: 'get',
        })
        let t2 = await temp.json()
        if(t2.valid == true){
            this.setOpenTime()
            let tempList = []
            this.setState({email:t2.res.email.stringValue,emailOriginal: t2.res.emailOriginal.stringValue, orderNum:t2.res.order.stringValue, store: t2.res.shop.stringValue, createdDate: t2.res.createdDate.stringValue})
            for (var i = 0;i<t2.res.items.arrayValue.values.length;i++){
            let tempItem = {
                name: t2.res.items.arrayValue.values[i].mapValue.fields.name.stringValue,
                variantid: t2.res.items.arrayValue.values[i].mapValue.fields.variantid.stringValue,
                reason: t2.res.items.arrayValue.values[i].mapValue.fields.reason.stringValue,
                status:t2.res.items.arrayValue.values[i].mapValue.fields.status.stringValue,
                productid:t2.res.items.arrayValue.values[i].mapValue.fields.productid.stringValue,
                store:t2.res.shop.stringValue,
                variantidGIT: t2.res.items.arrayValue.values[i].mapValue.fields.variantidGIT.stringValue,
                productidGIT: t2.res.items.arrayValue.values[i].mapValue.fields.productidGIT.stringValue,
                flag: t2.res.items.arrayValue.values[i].mapValue.fields.flag.stringValue,

            }
            tempList.push(tempItem)
        }
        await this.setState({itemList:tempList,step:3})
        }
        else{
            this.setState({step: 2})
            this.setState({cCode:''})
        }
    }

    render(){
        if(this.state.step == 1){
            return(
                <div className = 'sc1'>
                    <h1 className = 'scHeader'>FLINDEL SORTING CENTRE</h1>
                    <br/><br/><br/>
                    <p>Enter return code below:</p>
                    <label>     
                    <input type="cCode" value={this.state.cCode} onChange={this.handlecCode} />
                    </label>
                    <button onClick = {this.handleSubmit}>SUBMIT</button>
                    <br/><br/><br/><br/><br/>
                    <p>
                        Click below for the once-a-day confirmation to confirm all inventory is accounted for.
                    </p>
                    <button onClick = {this.dailyConfirm}>CHECK OVER</button>
                    <br/><br/><br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 2){
            return(
                <div className = 'sc1'>
                    <h1 className = 'scHeader'>FLINDEL SORTING CENTRE</h1>
                    <br/>
                    <p className = 'errorMessage'>No return exists under that code.</p>
                    <br/>
                    <p>Enter return code below:</p>  
                    <label>   
                    <input type="cCode" value={this.state.cCode} onChange={this.handlecCode} />
                    </label>
                    <button onClick = {this.handleSubmit}>SUBMIT</button>
                    <br/><br/><br/><br/><br/>
                    <p>
                        Click below for the once-a-day confirmation to confirm all inventory is accounted for.
                    </p>
                    <button onClick = {this.dailyConfirm}>CHECK OVER</button>
                    <br/><br/><br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 3){
            return(
                <div>
                    <div className = 'sc1'>
                        <h1 className = 'scHeader'>FLINDEL SORTING CENTRE</h1>
                        <br/>
                        <h3 className = 'subHeader'>Order Code: {this.state.cCode} . Store: {this.state.store}. Created on {this.state.createdDate}.</h3>
                        <br/>
                    </div>
                    <fieldset className = 'SC'>
                        <div className = 'itemContainerSC'>
                            <div className ='container1SCHeader'>
                                <p className = 'itemHeader'>IMAGE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container1SCHeader'>
                                <p className = 'itemHeader' > NAME  </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container1SCHeader'>
                                <p className = 'itemHeader'>VARIANT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container1SCHeader'>
                                <p className = 'itemHeader'>PRODUCT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container1SCHeader'>
                                <p className = 'itemHeader'>REASON FOR RETURN</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container1SCHeader'>
                                <p className = 'itemHeader'>STATUS</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container1SCHeader'>
                                <p className = 'itemHeader'>NEW ITEM (varID)</p>
                            </div>
                        </div>
                        {this.state.itemList.map((item)=>{
                        return <Item item={item} serveoname = {serveoname} step = {4} key={item.variantid} addItem={this.addItem.bind(this)} handleSelect={this.handleReasonChange.bind(this)}/>
                        })}
                    </fieldset>
                    <div className = 'sc1'>
                        <br/>   
                        <button onClick = {this.handleSubmit2}>SUBMIT</button>
                        <button onClick = {this.resetAll}>BACK</button>
                    </div>
                </div>
            )
        }
        else if(this.state.step == 4){
            return(
                <div className = 'sc1'>
                    <h1 className = 'scHeader'>SORTING CENTRE APP</h1>
                    <br/>
                    <h3>Update Successful</h3>
                    <br/>
                    <button onClick = {this.resetAll}>REFRESH</button>
                </div>
            )
        }
        //CHECK OVER
        else if (this.state.step == 5){
            return(
                <div>
                    <div className = 'sc1'>
                        <h1 className = 'scHeader'>SORTING CENTRE APP</h1>
                        <br/>
                        <br/>
                    </div>
                    <fieldset className = 'SC'>
                        <div className = 'itemContainerSC'>
                            <div className ='container2SCHeader'>
                                <p className = 'itemHeader'>IMAGE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container2SCHeader'>
                                <p className = 'itemHeader' > STORE  </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container2SCHeader'>
                                <p className = 'itemHeader' > NAME  </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container2SCHeader'>
                                <p className = 'itemHeader'>VARIANT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'container2SCHeader'>
                                <p className = 'itemHeader'>PRODUCT ID</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container2SCHeader'>
                                <p className = 'itemHeader'>QUANTITY</p>
                            </div>
                        </div>
                        {this.state.confirmList.map((item)=>{
                        return <Item handleQuantityChange = {this.handleQuantityChange.bind(this)} item={item} serveoname = {serveoname} step = {5} key={item.variantid} handleSelect={this.handleReasonChange.bind(this)}/>
                        })}
                    </fieldset>
                    <div className = 'sc1'>
                        <br/><br/>
                        <button onClick = {this.submitConfirmation}>CONFIRM</button>
                        <br/><br/><br/><br/>
                        <button onClick = {this.resetAll}>BACK</button>
                    </div>
                </div>
            )
        }
    }
}

export default sortingCentre