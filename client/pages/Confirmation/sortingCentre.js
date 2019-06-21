import React, {Component} from 'react';
import Item from './Item2'
const serveoname = 'campana'

/* NAVBAR to flip between map view and return portal view. Imported at the top of most pages */
class sortingCentre extends Component{
    constructor(props){
        super(props);
        this.state={
            orderNum:'',
            step: 1,
            itemList: []
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleOrderNum = this.handleOrderNum.bind(this)
        this.handleReasonChange = this.handleReasonChange.bind(this)
        this.handleSubmit2 = this.handleSubmit2.bind(this)
    }

    handleOrderNum(e){
        this.setState({orderNum:e.target.value})
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
        fetch(`https://${serveoname}.serveo.net/dbcall?method=${encodeURIComponent(6)}&code=${encodeURIComponent(this.state.orderNum)}&items=${encodeURIComponent(items)}`, {
            method: 'get',
        })
        this.setState({step:4})
    }


    async handleSubmit(){
        var temp = await fetch(`https://${serveoname}.serveo.net/dbcall?method=${encodeURIComponent(5)}&code=${encodeURIComponent(this.state.orderNum)}`, {
            method: 'get',
        })
        var t2 = await temp.json()
        var tempList = []
        if(t2.valid == true){
            for (var i = 0;i<t2.res.arrayValue.values.length;i++){
            var tempItem = {
                name: t2.res.arrayValue.values[i].mapValue.fields.name.stringValue,
                variantid: t2.res.arrayValue.values[i].mapValue.fields.variantid.stringValue,
                reason: t2.res.arrayValue.values[i].mapValue.fields.reason.stringValue,
                status:t2.res.arrayValue.values[i].mapValue.fields.status.stringValue
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
            return(
                <div>
                    <p>thanks. done</p>
                </div>
            )
        }
    }
}

export default sortingCentre