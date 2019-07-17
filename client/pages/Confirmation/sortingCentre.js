import React, {Component} from 'react';
import Item from './Item2'
const serveoname = 'optimo.serveo.net'

/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class sortingCentre extends Component{
    constructor(props){
        super(props);
        this.state={
            cCode:'',
            step: 1,
            itemList: [],
            email: '',
            orderNum:'',
            createdDate:'',
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handlecCode = this.handlecCode.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this)
        this.handleSubmit2 = this.handleSubmit2.bind(this)
        this.resetAll = this.resetAll.bind(this)
        this.finalCheck = this.finalCheck.bind(this)
        this.sendEmail = this.sendEmail.bind(this)
        this.sendToDB = this.sendToDB.bind(this)
    }

    //accept initial input
    handlecCode(e){
        this.setState({cCode:e.target.value})
    }

    //start from beginning
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
            if(temp.status == 'accepted' || temp.status == 'returning'){
                acceptList.push(temp)
            }
            else if (temp.status == 'rejected'){
                rejectList.push(temp)
            }
        }
        let RL = await JSON.stringify(rejectList)
        let AL = await JSON.stringify(acceptList)
        fetch(`https://${serveoname}/send?rejectList=${encodeURIComponent(RL)}&acceptList=${encodeURIComponent(AL)}&method=${encodeURIComponent(2)}&email=${encodeURIComponent(this.state.email)}&code=${encodeURIComponent(this.state.cCode)}`, 
        {
            method: 'post',
        })
    }
    
    //write to db
    async sendToDB(){
        let currentDate = ''
        currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
        let items = JSON.stringify(this.state.itemList)
        //write to pending + history, delete from reqReturns, all one transaction
        await fetch(`https://${serveoname}/dbcall?location=${encodeURIComponent('pending')}&method=${encodeURIComponent(1)}&orderNum=${encodeURIComponent(this.state.orderNum)}&code=${encodeURIComponent(this.state.cCode)}&originalDate=${encodeURIComponent(this.state.createdDate)}&date=${encodeURIComponent(currentDate)}&email=${encodeURIComponent(this.state.email)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
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

    async handleReasonChange(varID, status, oldstatus){
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
        await this.setState({itemList:tempList})
    }

    async handleSubmit2(){
        let items = await JSON.stringify(this.state.itemList)
        //update new reasons
        fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(6)}&code=${encodeURIComponent(this.state.cCode)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
        this.setState({step:4})
    }


    async handleSubmit(){
        let temp = await fetch(`https://${serveoname}/dbcall?method=${encodeURIComponent(5)}&code=${encodeURIComponent(this.state.cCode)}`, {
            method: 'get',
        })
        let t2 = await temp.json()
        this.setState({email:t2.res.email.stringValue,orderNum:t2.res.order.stringValue, createdDate: t2.res.createdDate.stringValue})
        let tempList = []
        if(t2.valid == true){
            for (var i = 0;i<t2.res.items.arrayValue.values.length;i++){
            let tempItem = {
                name: t2.res.items.arrayValue.values[i].mapValue.fields.name.stringValue,
                variantid: t2.res.items.arrayValue.values[i].mapValue.fields.variantid.stringValue,
                reason: t2.res.items.arrayValue.values[i].mapValue.fields.reason.stringValue,
                status:t2.res.items.arrayValue.values[i].mapValue.fields.status.stringValue,
                price:t2.res.items.arrayValue.values[i].mapValue.fields.price.stringValue
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
                    <input type="cCode" value={this.state.cCode} onChange={this.handlecCode} />
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
                    <input type="cCode" value={this.state.cCode} onChange={this.handlecCode} />
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
                    <h3>Order Code: {this.state.cCode}</h3>
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