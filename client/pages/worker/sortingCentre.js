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
            fullList: [],
            store:'',
            type: 'All',
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
        this.submitConfirmation = this.submitConfirmation.bind(this)
        this.handleConflicts = this.handleConflicts.bind(this)
        this.viewReturning = this.viewReturning.bind(this)
        this.viewAccepted = this.viewAccepted.bind(this)
        this.viewRejected = this.viewRejected.bind(this)
        this.viewAll = this.viewAll.bind(this)
    }

    viewAccepted(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'accepted'){
                tempList.push(this.state.fullList[i])
            }
            
        }
        for (var j = 0;j<tempList.length;j++){
            for (var i = 0;i<tempList.length -1;i++){
                if (tempList[i].flag == '-1' && tempList[i+1].flag!= '-1'){
                    let tempItem = tempList[i]
                    tempList[i] = tempList[i+1]
                    tempList[i+1] = tempItem
                }
            }
        }
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        this.setState({type: 'Accepted', confirmList: tempList})
    }

    viewReturning(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'returning'){
                tempList.push(this.state.fullList[i])
            }
        }
        for (var j = 0;j<tempList.length;j++){
            for (var i = 0;i<tempList.length -1;i++){
                if (tempList[i].flag == '-1' && tempList[i+1].flag!= '-1'){
                    let tempItem = tempList[i]
                    tempList[i] = tempList[i+1]
                    tempList[i+1] = tempItem
                }
            }
        }
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        this.setState({type: 'Returning', confirmList: tempList})
    }

    viewRejected(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'rejected'){
                tempList.push(this.state.fullList[i])
            }
        }
        for (var j = 0;j<tempList.length;j++){
            for (var i = 0;i<tempList.length -1;i++){
                if (tempList[i].flag == '-1' && tempList[i+1].flag!= '-1'){
                    let tempItem = tempList[i]
                    tempList[i] = tempList[i+1]
                    tempList[i+1] = tempItem
                }
            }
        }
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        this.setState({type: 'Rejected', confirmList: tempList})
    }

    viewAll(){
        let itemList = this.state.fullList
        for (var j = 0;j<itemList.length;j++){
            for (var i = 0;i<itemList.length -1;i++){
                if (itemList[i].store > itemList[i+1].store ){
                    let tempItem = itemList[i]
                    itemList[i] = itemList[i+1]
                    itemList[i+1] = tempItem
                }
            }
        }
        for (var i = 0;i<itemList.length;i++){
            itemList[i].index = i
        }
        this.setState({type: 'All', confirmList:itemList})
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

    submitConfirmation(){
        let tempList = []
        for (var i = 0;i<this.state.confirmList.length;i++){
            if (this.state.confirmList[i].value == 0){
                let conflict = {
                    variantid: this.state.confirmList[i].variantid,
                    status: this.state.confirmList[i].status,
                    difference: -1
                }
                tempList.push(conflict)
            }
        }
        this.handleConflicts(tempList)
        //this.setState({step:4})
    }

    handleConflicts(conflicts){
        for (var i = 0;i<conflicts.length;i++){
            if (conflicts[i].difference < 0){
                console.log(conflicts[i].variantid+ ' - '+ conflicts[i].status+' - '+'remove')
            }
        }
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
                if (tempList[i].flag == '-1' && tempList[i+1].flag!= '-1'){
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
        //load items
        let itemList = []
        let itemsJSON = await items.json()
        for (var i = 0;i<itemsJSON.length;i++){
            if (itemsJSON[i].flag.stringValue == '1' || itemsJSON[i].flag.stringValue == '0'){
                let tempItem = {
                variantid:itemsJSON[i].variantid.stringValue,
                productid: itemsJSON[i].productid.stringValue,
                quantity: 1,
                status: itemsJSON[i].status.stringValue,
                name: itemsJSON[i].name.stringValue,
                store: itemsJSON[i].store,
                value: 0
            }
            itemList.push(tempItem)
            }
        }
        //sort
        for (var j = 0;j<itemList.length;j++){
            for (var i = 0;i<itemList.length -1;i++){
                if (itemList[i].store > itemList[i+1].store ){
                    let tempItem = itemList[i]
                    itemList[i] = itemList[i+1]
                    itemList[i+1] = tempItem
                }
            }
        }
        for (var i = 0;i<itemList.length;i++){
            itemList[i].index = i
        }
        this.setState({confirmList:itemList, fullList: itemList})
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

    handleQuantityChange(index, varID){
        let tempList = this.state.confirmList
        tempList[index].value = 1 - tempList[index].value
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
                        <h1 className = 'scHeader'>SORTING CENTRE APP - Checkover</h1>
                        <br/>
                        <br/>
                    </div>
                    <div>
                        <button onClick = {this.viewReturning}>RETURNING</button>
                        <button onClick = {this.viewAccepted}>ACCEPTED</button>
                        <button onClick = {this.viewRejected}>REJECTED</button>
                        <button onClick = {this.viewAll}>ALL</button>
                        <br/><br/>
                    </div>
                    <h1 className = 'scHeader'>Currently Viewing: {this.state.type}</h1>
                    <br/>
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
                        {this.state.confirmList.map((item, index)=>{
                        return <Item handleQuantityChange = {this.handleQuantityChange.bind(this)} item={item} serveoname = {serveoname} step = {5} key={item.variantid + index} handleSelect={this.handleReasonChange.bind(this)}/>
                        })}
                    </fieldset>
                    <div className = 'sc1'>
                        <br/><br/>
                        <button onClick = {this.submitConfirmation}>CONFIRM</button>
                        <button onClick = {this.resetAll}>BACK</button>
                        <br/><br/>
                    </div>
                </div>
            )
        }
    }
}

export default sortingCentre