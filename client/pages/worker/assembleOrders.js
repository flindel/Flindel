import React, { Component } from 'react';
import '../Confirmation/universal.css'
import './flindelInterface.css'
import Order from './order'
import {serveo_name} from '../config'
const sname = serveo_name
const serveoname = sname.substring(8)

class assembleOrders extends Component {
    constructor(props){
        super(props);
        this.state = {
            step: 1,
            workerID: '1',
            orderList:[],
            loadingMessage:'Loading.................',
        }
        this.handleWorkerID = this.handleWorkerID.bind(this)
        this.go = this.go.bind(this)
        this.loadFulfillments = this.loadFulfillments.bind(this)
        this.changeID = this.changeID.bind(this)
        this.changeMessage = this.changeMessage.bind(this)
        this.changeOrderStatus = this.changeOrderStatus.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.changeItemStatus = this.changeItemStatus.bind(this)
        this.changeDriverID = this.changeDriverID.bind(this)
    }

    componentDidMount(){
        this.loadFulfillments()
    }

    changeDriverID(index, newID){
        let tempList = this.state.orderList
        tempList[index].workerid = newID
        this.setState({orderList:tempList})
    }

    changeMessage(newMessage, index){
        let tempList = this.state.orderList
        tempList[index].comment = newMessage
        this.setState({orderList:tempList})
    }

    handleWorkerID(e){
        this.setState({workerID:e.target.value})
    }

    async handleSubmit(){
        let tempList = this.state.orderList
        for (var i = 0;i<tempList.length;i++){
            delete tempList[i]['index']
            delete tempList[i]['backgroundColor']
            for (var j = 0;j<tempList[i].items.length;j++){
                delete tempList[i].items[j]['index']
                tempList[i].items[j].fulfilled = parseInt(tempList[i].items[j].fulfilled)
                tempList[i].items[j].quantity = parseInt(tempList[i].items[j].quantity)
            }
        }
        let orderString = JSON.stringify(tempList)
        fetch(`https://${serveoname}/fulfillment/update?orders=${encodeURIComponent(orderString)}`, {
            method: 'put',
        })
        this.setState({step:2})
    }

    //update status if individual items and see if this affects the order status
    changeItemStatus(itemIndex, orderIndex, value){
        let tempList = this.state.orderList
        tempList[orderIndex].items[itemIndex].fulfilled = value
        if (value == 1){
            tempList[orderIndex].items[itemIndex].backgroundColor = 'itemOrderGreen'  
        }
        if (value == -1){
            tempList[orderIndex].items[itemIndex].backgroundColor = 'itemOrderRed'  
        }
        tempList[orderIndex].status = 'complete'
        let successful = true
        let failed = true
        for (var i = 0;i<tempList[orderIndex].items.length;i++){
            if (tempList[orderIndex].items[i].fulfilled == 0){
                tempList[orderIndex].status = 'incomplete'
            }
            if (tempList[orderIndex].items[i].fulfilled != 1){
                successful = false
            }
            if (tempList[orderIndex].items[i].fulfilled != -1){
                failed = false
            }
        }
        if (successful){
            tempList[orderIndex].status = 'successful'
        }
        else if (failed){
            tempList[orderIndex].status = 'failed'
        }
        for (var i = 0;i<tempList.length;i++){
            for (var j = i+1;j<tempList.length;j++){
                if ((tempList[i].status == 'successful'|| tempList[i].status == 'complete' || tempList[i].status == 'failed') && tempList[j].status == 'incomplete'){
                    let tempOrder = tempList[i]
                    tempList[i] = tempList[j]
                    tempList[j] = tempOrder
                }
            }
        }
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        this.setState({orderList:tempList})
    }

    changeOrderStatus(index, val){
        let tempList = this.state.orderList
        if (val == 1){
            tempList[index].status = 'successful'
            //tempList[index].backgroundColor = 'lightgreen'
            for (var i = 0;i<tempList[index].items.length;i++){
                tempList[index].items[i].fulfilled = 1
            }
        }
        else if (val == 0){
            tempList[index].status = 'incomplete'
            //tempList[index].backgroundColor = ''
            for (var i = 0;i<tempList[index].items.length;i++){
                tempList[index].items[i].fulfilled = 0
            }
        }
        else if (val == -1){
            tempList[index].status = 'failed'
            //tempList[index].backgroundColor = 'lightpink'
            for (var i = 0;i<tempList[index].items.length;i++){
                tempList[index].items[i].fulfilled = -1
            }
        }
        
        for (var i = 0;i<tempList.length;i++){
            for (var j = i+1;j<tempList.length;j++){
                if ((tempList[i].status == 'successful'|| tempList[i].status == 'complete' || tempList[i].status == 'failed') && tempList[j].status == 'incomplete'){
                    let tempOrder = tempList[i]
                    tempList[i] = tempList[j]
                    tempList[j] = tempOrder
                }
            }
        }
        for (var i = 0;i<tempList.length;i++){
            tempList[i].index = i
        }
        this.setState({orderList:tempList})
    }

    async loadFulfillments(){
        //load fulfillments here
        let temp = await fetch(`https://${serveoname}/fulfillment/assemble?workerID=${encodeURIComponent(this.state.workerID)}`, {
            method: 'get',
            })
        let tJSON= await temp.json()
        let orders = []
        for (var i = 0;i<tJSON.length;i++){
            let tempOrder = {
                code: tJSON[i].code.stringValue,
                comment: tJSON[i].comment.stringValue,
                dateCreated: tJSON[i].dateCreated.stringValue,
                fulfillmentid: tJSON[i].fulfillmentid.stringValue,
                name: tJSON[i].name.stringValue,
                orderid: tJSON[i].orderid.stringValue,
                shippingAddress: tJSON[i].shippingAddress.stringValue,
                status: tJSON[i].status.stringValue,
                store: tJSON[i].store.stringValue,
                workerid: tJSON[i].workerid.stringValue,
                items:[],
                backgroundColor: '',
                index: i
            }
            for (var j = 0;j<tJSON[i].items.arrayValue.values.length;j++){
                let spot = tJSON[i].items.arrayValue.values[j]
                let tempItem = {
                    fulfilled: spot.mapValue.fields.fulfilled.integerValue,
                    itemid: spot.mapValue.fields.itemid.stringValue,
                    name: spot.mapValue.fields.name.stringValue,
                    productid: spot.mapValue.fields.productid.stringValue,
                    quantity: spot.mapValue.fields.quantity.integerValue,
                    variantid: spot.mapValue.fields.variantid.stringValue,
                    index: j,
                    backgroundColor: 'itemOrder'
                }
                tempOrder.items.push(tempItem)
            }
            orders.push(tempOrder)
        }
        this.setState({loadingMessage:'', orderList:orders})
    }

    go(){
        this.setState({step:1})
        this.loadFulfillments()
    }

    changeID(){
        this.setState({step:0, workerID: ''})
    }

    //conditional render : 0 login, 1 action, 2 confirmation
    render() {
        if (this.state.step == 0){
            return(
                <div>
                    <h1 className = 'scHeader'>ASSEMBLE ORDERS</h1>
                    <br/><br/>
                    <p>Enter your worker ID below</p>
                    <input type = 'text' value = {this.state.workerID} onChange = {this.handleWorkerID}></input>
                    <button onClick = {this.go}>SUBMIT</button>
                    <br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 1){
            return(
                <div>
                    <h1 className = 'scHeader'>ASSEMBLE ORDERS</h1>
                    <br/>
                    <br/>
                    <h3 className = 'subHeader'>Today's Orders to Assemble:</h3>
                    <br/>
                    <fieldset className = 'SC'>
                        <div className = 'itemContainerSC'>
                            <div className ='deliveryHeaderS'>
                                <p className = 'itemHeader'>CODE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className ='deliveryHeaderS'>
                                <p className = 'itemHeader' >INFORMATION </p>   
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'deliveryHeaderS'>
                                <p className = 'itemHeader'>STORE</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'deliveryHeaderL'>
                                <p className = 'itemHeader'>ITEMS</p>
                            </div>
                            <div className = 'vert'>
                                <hr className = 'vertHeader'/>
                            </div>
                            <div className = 'deliveryHeaderM'>
                                <p className = 'itemHeader'>COMMENT</p>
                            </div>
                        </div>
                        {this.state.orderList.map((order,index)=>{
                            return <Order order={order} step = {1} changeDriverID = {this.changeDriverID.bind(this)} changeItemStatus = {this.changeItemStatus.bind(this)} changeOrderStatus = {this.changeOrderStatus.bind(this)}changeMessage = {this.changeMessage.bind(this)} serveoname = {serveoname} key={order.code +index}/>
                        })}
                    <p>{this.state.loadingMessage}</p>
                    </fieldset>
                    <br/><br/><br/><br/>
                    <button onClick = {this.handleSubmit}>SAVE</button>
                    <br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 2){
            return(
                <div>
                    <h1 className = 'scHeader'>ASSEMBLE ORDERS</h1>
                    <br/>
                    <p className = 'workerID'>Logged in as: #{this.state.workerID} <br/>
                        <button onClick = {this.changeID}>LOGOUT</button>
                    </p>
                    <br/><br/>
                    <p>The changes have been saved</p>
                    <br/>
                    <button onClick = {this.go}>CONTINUE ASSEMBLING</button>
                    <br/><br/>
                    <button onClick = {this.props.back}>EXIT</button>
                </div>
            )
        }
    }
}

export default assembleOrders;