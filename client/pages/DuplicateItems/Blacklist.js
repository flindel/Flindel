import React, { Component } from 'react';
import {serveo_name} from '../config';
import {getShopID} from './Shopify';


const myStyle = {
    color: 'red'
}
class Blacklist extends Component {
    constructor(props){
        super(props);
        this.state = {
            storeName: '',
            step: 1,
            items : [],
            deleteItems : [],
            addItems : [],
            addIn : '',
            deleteIn :'',
            errorMessage:''
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.getItems = this.getItems.bind(this)
        this.handleChangeAdd = this.handleChangeAdd.bind(this)
        this.handleChangeDelete = this.handleChangeDelete.bind(this)
        this.addToBlacklist = this.addToBlacklist.bind(this)
        this.deleteFromBlacklist = this.deleteFromBlacklist.bind(this)
        getShopID(this.handleSubmit);
    }
    handleInputChange(e){
        this.setState({storeName:e.target.value})
    }
    handleChangeAdd(e){
        this.setState({addIn:e.target.value})
    }
    handleChangeDelete(e){
        this.setState({deleteIn:e.target.value})
    }
    addToBlacklist(){
        this.setState({errorMessage:''})
        let toAdd = this.state.addIn;
        this.setState({addIn: ''})
        let tempList = this.state.items
        if (tempList.indexOf(toAdd)==-1){
            tempList.push(toAdd)
            tempList.sort()
        }
        else{
            this.setState({errorMessage:'This item is already on the blacklist.'})
        }
        this.setState({items:tempList})
        fetch(`${serveo_name}/dbcallGit/addBlacklist?id=${encodeURIComponent(toAdd)}&store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'get',
        })
    }
    deleteFromBlacklist(){
        this.setState({errorMessage:''})
        let toDelete = this.state.deleteIn;
        this.setState({deleteIn:''})
        let found = false
        let tempList = this.state.items
        for (var i = 0;i<tempList.length;i++){
            if (tempList[i]==toDelete){
                found = true
                tempList.splice(i,1)
            }
        }
        if(found == false){
            this.setState({errorMessage:'This item is not currently on the blacklist.'})
        }
        this.setState({items:tempList})
        fetch(`${serveo_name}/dbcallGit/deleteBlacklist?id=${encodeURIComponent(toDelete)}&store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'get',
        })
    }
    async handleSubmit(storeName){
        const temp = storeName.shop_id
        console.log("storeName:", temp);
        await this.setState({storeName:temp.toLowerCase(),step:2})
        this.getItems()
    }
    async getItems(){
        let temp = await fetch(`${serveo_name}/dbcallGit/getBlacklist?store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'get',
        })
        let json = await temp.json()
        this.setState({items:json.res.sort()})
    }

    render() {
        if (this.state.step == 1){
            return (
                <div>
                  <h1>Loading Blacklist</h1>
                </div>
             );
        }
        if (this.state.step == 2){
            return(
            <div>
                <p>{this.state.storeName} Blacklist</p>
                <br/>
                <label>Add item:
                    <input value = {this.state.addIn} onChange = {this.handleChangeAdd} type = 'text'></input>
                </label>
                <button onClick = {this.addToBlacklist}>ADD</button>
                <label> Delete item:
                    <input onChange = {this.handleChangeDelete} value = {this.state.deleteIn} type = 'text'></input>
                </label>
                <button onClick = {this.deleteFromBlacklist}>DELETE</button>
                <br/><br/>
                <p style = {myStyle}>
                    {this.state.errorMessage}
                </p>
                <br/>
                <p>The following items are currently on the blacklist.</p>
                <p>If these items are returned, they will not be made available immediately for resale, and will be eventually shipped back to the distributor.</p>
                <div>
                    {this.state.items.map((curr, index) => (
                    <p>{index + 1} - {curr}</p>
                    ))}
                </div>
            </div>
            )
        }
        else{
            return(
            <div>
                <p>bad</p>
            </div>
            )
        }
    }
}
export default Blacklist;
