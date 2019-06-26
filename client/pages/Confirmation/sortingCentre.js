import React, {Component} from 'react';
import Item from './Item2'
const serveoname = 'optimu.serveo.net'

/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class sortingCentre extends Component{
    constructor(props){
        super(props);
        this.state={
            orderNum:'',
            step: 1,
            itemList: [],
            email: ''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleOrderNum = this.handleOrderNum.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this)
        this.handleSubmit2 = this.handleSubmit2.bind(this)
        this.resetAll = this.resetAll.bind(this)
        this.finalCheck = this.finalCheck.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
    }

    handleOrderNum(e){
        this.setState({orderNum:e.target.value})
    }

    resetAll(){
        this.setState({orderNum:'',
        step: 1,
        itemList: []})
    }

    async sendEmail(){
        var rejectList = []
        var acceptList = []
        for (var i = 0;i<this.state.itemList.length;i++){
            let temp = this.state.itemList[i]
            if(temp.status == 'accepted'){
                acceptList.push(temp)
            }
            else if (temp.status == 'rejected'){
                rejectList.push(temp)
            }
        }
        let RL = await JSON.stringify(rejectList)
        let AL = await JSON.stringify(acceptList)
        fetch(`https://${serveoname}/send?rejectList=${encodeURIComponent(RL)}&acceptList=${encodeURIComponent(AL)}&method=${encodeURIComponent(2)}&email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.orderNum)}`, 
        {
            method: 'post',
        })
    }
    
    sendToDB(){
        //write to shopify
        let items = JSON.stringify(this.state.itemList)
        //1 for write, 2 for read
        fetch(`https://${serveoname}/dbcall?location=${encodeURIComponent('pending')}&method=${encodeURIComponent(1)}&code=${encodeURIComponent(this.state.orderNum)}&email=${encodeURIComponent(this.state.email)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
        fetch(`https://${serveoname}/dbcall?&method=${encodeURIComponent(7)}&code=${encodeURIComponent(this.state.orderNum)}`, {
            method: 'get',
        })
    }

    finalCheck(){
        var found = false
        var count = 0
        while(count<this.state.itemList.length && found == false){
            let temp = this.state.itemList[count]
            if (temp.status == 'received' || temp.status == 'submitted'){
                found = true
            }
            count ++
        }
        if (found == true){
            //do nothing
        }
        else{
            this.sendEmail()
            this.sendToDB()
        }
    }

    async handleReasonChange(varID, status, oldstatus){
        var count = 0
        var found = false
        var tempList = this.state.itemList
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
        await this.setState({itemList:tempList})
    }

    async handleSubmit2(){
        let items = await JSON.stringify(this.state.itemList)
        fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(6)}&code=${encodeURIComponent(this.state.orderNum)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
        this.setState({step:4})
    }


    async handleSubmit(){
        var temp = await fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(5)}&code=${encodeURIComponent(this.state.orderNum)}`, {
            method: 'get',
        })
        var t2 = await temp.json()
        this.setState({email:t2.res.email.stringValue})
        var tempList = []
        if(t2.valid == true){
            for (var i = 0;i<t2.res.items.arrayValue.values.length;i++){
            var tempItem = {
                name: t2.res.items.arrayValue.values[i].mapValue.fields.name.stringValue,
                variantid: t2.res.items.arrayValue.values[i].mapValue.fields.variantid.stringValue,
                reason: t2.res.items.arrayValue.values[i].mapValue.fields.reason.stringValue,
                status:t2.res.items.arrayValue.values[i].mapValue.fields.status.stringValue
            }
            tempList.push(tempItem)
        }
        await this.setState({itemList:tempList,step:3})
        }
        else{
            this.setState({step: 2})
        }
    }

    render(){
        if(this.state.step == 1){
            return(
                <div>
                    <h1>SORTING CENTRE APP</h1>
                    <p>Enter return code below:</p>
                    <label>     
                    <input type="orderNum" value={this.state.orderNum} onChange={this.handleOrderNum} />
                    </label>
                    <button onClick = {this.handleSubmit}>SUBMIT</button>
                </div>
            )
        }
        else if (this.state.step == 2){
            return(
                <div>
                    <h1>SORTING CENTRE APP</h1>
                    <p>Enter return code below:</p>
                    <label>     
                    <input type="orderNum" value={this.state.orderNum} onChange={this.handleOrderNum} />
                    </label>
                    <button onClick = {this.handleSubmit}>SUBMIT</button>
                    <br/>
                    <p>no order found. please try again</p>
                </div>
            )
        }
        else if (this.state.step == 3){
            return(
                <div>
                    <h1>SORTING CENTRE APP</h1>
                    <h3>Order Code: {this.state.orderNum}</h3>
                    {this.state.itemList.map((item)=>{
                    return <Item item={item} step = {4} key={item.variantid} handleSelect={this.handleReasonChange.bind(this)}/>
                })}
                        <button onClick = {this.handleSubmit2}>SUBMIT</button>
                </div>
            )
        }
        else if(this.state.step == 4){
            this.finalCheck()
            return(
                <div>
                    <h1>SORTING CENTRE APP</h1>
                    <p>Update Successful</p>
                    <button onClick = {this.resetAll}>REFRESH</button>
                </div>
            )
        }
    }
}

export default sortingCentre