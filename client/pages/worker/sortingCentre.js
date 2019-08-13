import React, {Component} from 'react';
import Item from './itemSC'
import {serveo_name} from '../config'
import './sorting.css'
const sname = serveo_name
const serveoname = sname.substring(8)

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
            newStore:'',
            newStatus:'',
            newVarID: '',
            newCode: '',
            newOrder:''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handlecCode = this.handlecCode.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleSubmit2 = this.handleSubmit2.bind(this)
        this.resetAll = this.resetAll.bind(this)
        this.finalCheck = this.finalCheck.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
        this.dailyConfirm = this.dailyConfirm.bind(this)
        this.loadConfirmList = this.loadConfirmList.bind(this)
        this.addItem4 = this.addItem4.bind(this)
        this.addItem5 = this.addItem5.bind(this)
        this.setOpenTime = this.setOpenTime.bind(this)
        this.setCloseTime = this.setCloseTime.bind(this)
        this.submitConfirmation = this.submitConfirmation.bind(this)
        this.handleConflicts = this.handleConflicts.bind(this)
        this.viewReturning = this.viewReturning.bind(this)
        this.viewAccepted = this.viewAccepted.bind(this)
        this.viewRejected = this.viewRejected.bind(this)
        this.viewAll = this.viewAll.bind(this)
        this.handleNewInput = this.handleNewInput.bind(this)
        this.sortList = this.sortList.bind(this)
        this.getItemInformation = this.getItemInformation.bind(this)
    }

    //handle input of new variant id
    handleNewInput(e){
        this.setState({[e.target.name]:e.target.value})
    }

    //view accepted items
    viewAccepted(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'accepted'){
                tempList.push(this.state.fullList[i])
            }
            
        }
        tempList = this.sortList(tempList)
        this.setState({type: 'Accepted', confirmList: tempList})
    }
    //view returning items
    viewReturning(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'returning'){
                tempList.push(this.state.fullList[i])
            }
        }
        tempList = this.sortList(tempList)
        this.setState({type: 'Returning', confirmList: tempList})
    }
    //view rejected items
    viewRejected(){
        let tempList = []
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].status == 'rejected'){
                tempList.push(this.state.fullList[i])
            }
        }
        tempList = this.sortList(tempList)
        this.setState({type: 'Rejected', confirmList: tempList})
    }
    //view all items
    viewAll(){
        let itemList = this.sortList(this.state.fullList)
        this.setState({type: 'All', confirmList:itemList})
    }
    //sorts items, used in above functions
    sortList(tempList){
        for (var j = 0;j<tempList.length;j++){
            for (var i = 0;i<tempList.length -1;i++){
                if (tempList[i].flag == '-1' && tempList[i+1].flag!= '-1'){
                    let tempItem = tempList[i]
                    tempList[i] = tempList[i+1]
                    tempList[i+1] = tempItem
                }
            }
        }
        //give each item index so it's easy to identify changes
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        return tempList
    }
    //write time to firebase of when processing began
    setOpenTime(){
        fetch(`https://${serveoname}/return/requested/openTime?code=${encodeURIComponent(this.state.cCode)}`, 
        {
            method: 'PUT',
        })
    }
    //write time to firebase of when processing ended
    setCloseTime(){
        fetch(`https://${serveoname}/return/requested/closeTime?code=${encodeURIComponent(this.state.cCode)}`, 
        {
            method: 'PUT',
        })
    }

    //handle submit of confirmation page
    submitConfirmation(){
        let toContinue = true
        //make sure each item was checked
        for (var i = 0;i<this.state.fullList.length;i++){
            if (this.state.fullList[i].value == 0){
                toContinue = false
            }
        }
        if (toContinue){
            let tempList = []
            for (var i = 0;i<this.state.fullList.length;i++){
                if (this.state.fullList[i].value == -1){
                    tempList.push(this.state.fullList[i])
                }
            }
            //write items or something
            this.handleConflicts(tempList)
            //this.setState({step:4})
        }
        else{
            //alert, don't allow proceed
            alert('You missed an item. Each item must be confirmed.')
        }
    }

    handleConflicts(conflicts){
        for (var i = 0;i<conflicts.length;i++){
            console.log(conflicts[i])
        }
    }

    //add item from first sorting center run, adds and then 'deletes' other
    addItem4(newItem, oldItem){
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

    //add item in sorting center second, adds pure item
    async addItem5(){
        let store = this.state.newStore + '.myshopify.com'
        let varID = this.state.newVarID
        let code = this.state.newCode
        let order = this.state.newOrder
        //get product information
        let [productID, name] = await this.getItemInformation(varID, store)
        let tempItem = {
            variantid:varID,
            productid: productID,
            quantity: 1,
            status: 'rejected',
            name: name,
            store: store,
            value: 0,
            valueColor: 'grey',
            order: order,
            code: code,
            index: this.state.fullList.length
        }
        //make sure product is real
        if (productID != 0){
            let tempList = this.state.fullList
            tempList.push(tempItem)
            this.setState({fullList:tempList, newOrder: '', newVarID:'', newCode:'',newStore:''})
            this.viewAll()
        }
        else{
            alert('That is not a real product')
        }
    }
    //get information about an item
    async getItemInformation(varID, store){
        let temp = await fetch(`https://${serveoname}/products/all?store=${encodeURIComponent(store)}`, {
            method: 'get',
            })
        let productID = '0'
        let name = 'name'
        let productsJSON = await temp.json()
        //look for its product id from its variant
        for (var i = 0;i<productsJSON.products.length;i++){
            let tempItem = productsJSON.products[i]
            for (var j=0;j<tempItem.variants.length;j++){
                let tempVar = tempItem.variants[j]
                if (tempVar.id == varID){
                    productID = tempVar.product_id
                    name = tempItem.title + ' - ' + tempVar.title
                }
            }
        }
        return [productID, name]
    }

    //when checkover button is clicked
    async dailyConfirm(){
        this.setState({step:5})
        await this.loadConfirmList()
    }

    //load all items for daily checkover
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
                value: 0,
                valueColor: 'grey',
                order: itemsJSON[i].order,
                code: itemsJSON[i].code,
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
        let temp = e.target.value.toUpperCase()
        this.setState({cCode:temp})
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
            //this.sendEmail()
            this.sendToDB()
        }
    }

    //handle changing status
    handleStatusChange(index, status, step){
        let count = 0
        let found = false
        if (step == 4){
            let tempList = this.state.itemList
            tempList[index].status = status
            this.setState({itemList:tempList})
        }
        else if (step == 5){
            let tempList = this.state.confirmList
            tempList[index].status = status
            this.setState({confirmList:tempList})
        }
    }

    //checkover stage, flips green or red
    handleQuantityChange(index, next){
        if (next == -1){
            //don't have item
            let tempList = this.state.confirmList
            tempList[index].value = -1
            tempList[index].valueColor = 'red'
            this.setState({confirmList:tempList})
        }
        else{
            //have item
            let tempList = this.state.confirmList
            tempList[index].value = 1
            tempList[index].valueColor = 'green'
            this.setState({confirmList:tempList})
        }
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
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        await this.setState({itemList:tempList,step:3})
        }
        else{
            this.setState({step: 2})
            this.setState({cCode:''})
        }
    }

    render(){
        //sorting center home
        if(this.state.step == 1){
            return(
                <div className = 'sc1'>
                    <h1 className = 'scHeader'>FLINDEL SORTING CENTRE</h1>
                    <br/>
                    <br/><br/>
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
        //order doesn't exist error message
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
        //first checkover, single order
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
                        return <Item item={item} serveoname = {serveoname} step = {4} key={item.variantid} addItem={this.addItem4.bind(this)} handleSelect={this.handleStatusChange.bind(this)}/>
                        })}
                    </fieldset>
                    <div className = 'sc1'>
                        <br/>   
                        <button onClick = {this.resetAll}>BACK</button>
                        <button onClick = {this.handleSubmit2}>SUBMIT</button>
                    </div>
                </div>
            )
        }
        //thank you page after first order
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
        //big checkover page
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
                                <p className = 'itemHeader' > CODE  </p>   
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
                            <div className = 'container2SCHeader'>
                                <p className = 'itemHeader'>STATUS</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='container2SCHeader'>
                                <p className = 'itemHeader'>EXISTS</p>
                            </div>
                        </div>
                        {this.state.confirmList.map((item, index)=>{
                        return <Item handleQuantityChange = {this.handleQuantityChange.bind(this)} item={item} serveoname = {serveoname} step = {5} key={item.variantid + index} handleSelect={this.handleStatusChange.bind(this)}/>
                        })}
                    </fieldset>
                    <br/>
                    <p>ADD ITEM:</p>
                    <br/>
                        <label> Store:
                            <input name = 'newStore' value={this.state.newStore} onChange={this.handleNewInput} />
                        </label>
                        <label> Variant ID:   
                            <input name = 'newVarID' value={this.state.newVarID} onChange={this.handleNewInput} />
                        </label>
                        <label> Code:  
                            <input name = 'newCode' value={this.state.newCode} onChange={this.handleNewInput} />
                        </label>
                        <label> Order:
                            <input name = 'newOrder' value = {this.state.newOrder} onChange = {this.handleNewInput}/>
                        </label>
                        <button onClick = {this.addItem5}>ADD</button>
                    <div className = 'sc1'>
                        <br/><br/>
                        <button onClick = {this.resetAll}>BACK</button>
                        <button onClick = {this.submitConfirmation}>CONFIRM</button>
                        <br/><br/>
                    </div>
                </div>
            )
        }
    }
}

export default sortingCentre