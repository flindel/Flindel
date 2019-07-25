import React, { Component } from 'react';
import './universal.css'
import {serveo_name} from '../config'
const sname = serveo_name
const serveoname = sname.substring(8)
//for error message - alows page to stand alone
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
            errorMessage: '',
            loginMessage: 'LOADING............',
            valid: 0
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.getItems = this.getItems.bind(this)
        this.handleChangeAdd = this.handleChangeAdd.bind(this)
        this.handleChangeDelete = this.handleChangeDelete.bind(this)
        this.addToBlacklist = this.addToBlacklist.bind(this)
        this.deleteFromBlacklist = this.deleteFromBlacklist.bind(this)
        this.restart = this.restart.bind(this)
    }

    restart(){
        this.setState({
            storeName: '',
            step: 1,
            items : [],
            deleteItems : [],
            addItems : [],
            addIn : '',
            deleteIn :'',
            errorMessage: '',
            loginMessage: 'LOADING............',
            valid: 0
        })
    }

    //input field for entering store name at beginning of process
    handleInputChange(e){
        this.setState({storeName:e.target.value})
    }

    //input field for entering id of item to add
    handleChangeAdd(e){
        this.setState({addIn:e.target.value})
    }

    //input field for entering id of item to delete
    handleChangeDelete(e){
        this.setState({deleteIn:e.target.value})
    }

    //add item to blacklist (on submit of add)
    addToBlacklist(){
        if (this.state.valid){
        //make sure previous error message goes away
        this.setState({errorMessage:''})
        let toAdd = this.state.addIn;
        this.setState({addIn: ''})
        let tempList = this.state.items
        //make sure item doesn't exist so we're not making a duplicate
        if (tempList.indexOf(toAdd)==-1){
            tempList.push(toAdd)
            tempList.sort()
        }
        //show error message if they enter duplicate
        else{
            this.setState({errorMessage:'This item is already on the blacklist.'})
        }
        let itemString = JSON.stringify(tempList)
        //save to db
        this.setState({items:tempList})
        fetch(`https://${serveoname}/blacklist?items=${encodeURIComponent(itemString)}&store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'put',
        })
        }
    }

    //delete an item from blacklist (on submit of delete)
    deleteFromBlacklist(){
        if (this.state.valid){
            //make sure previous error message goes away
        this.setState({errorMessage:''})
        let toDelete = this.state.deleteIn;
        this.setState({deleteIn:''})
        let found = false
        let tempList = this.state.items
        //make sure there's something there to delete
        for (var i = 0;i<tempList.length;i++){
            if (tempList[i]==toDelete){
                found = true
                tempList.splice(i,1)
            }
        }
        //show error message if they make mistake
        if(found == false){
            this.setState({errorMessage:'This item is not currently on the blacklist.'})
        }
        let itemString = JSON.stringify(tempList)
        //save to db
        this.setState({items:tempList})
        fetch(`https://${serveoname}/blacklist?items=${encodeURIComponent(itemString)}&store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'put',
        })
        }
    }

    //handle submit of store name - very beginning
    async handleSubmit(){
        let temp = this.state.storeName
        temp+='.myshopify.com'
        await this.setState({storeName:temp.toLowerCase(),step:2})
        this.getItems()
    }

    //get items on blacklist of current store
    async getItems(){
        let temp = await fetch(`https://${serveoname}/blacklist?store=${encodeURIComponent(this.state.storeName)}`, {
            method: 'get',
        })
        let json = await temp.json()
        if (json.res.length == 0){
            this.setState({loginMessage: 'THIS STORE DOES NOT EXIST'})
        }
        else{
            this.setState({valid: 1, loginMessage: '', items:json.res.sort()})
        }
    }

    //conditional render - step1 for enter store, step2 for doing stuff
    render() {
        if (this.state.step == 1){
            return (
                <div>
                    <h1>Blacklist</h1> 
                    <br></br>
                    <label> 
                        Enter your store name below:
                        <br/>
                        <input type = 'text' value = {this.state.storeName} onChange = {this.handleInputChange}></input>
                    </label>
                    <button onClick = {this.handleSubmit}>SUBMIT</button>
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
                <br/>
                <p>{this.state.loginMessage}</p>
                <div>
                    {this.state.items.map((curr, index) => (
                    <p>{index + 1} - {curr}</p>
                    ))}
                </div>
                <br/><br/><br/><br/><br/>
                <button onClick = {this.restart}>RESTART</button>
            </div>
            )
        }
    }
}

export default Blacklist;