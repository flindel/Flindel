import React, { Component } from 'react';
import '../Confirmation/universal.css'
import './flindelInterface.css'
import {serveo_name} from '../config'
const sname = serveo_name
const serveoname = sname.substring(8)

class deliverItems extends Component {
    constructor(props){
        super(props);
        this.state = {
            step: 0,
            workerID: ''
        }
        this.handleWorkerID = this.handleWorkerID.bind(this)
        this.selectFulfillments = this.selectFulfillments.bind(this)
        this.changeID = this.changeID.bind(this)
    }

    handleWorkerID(e){
        this.setState({workerID:e.target.value})
    }

    selectFulfillments(){
        this.setState({step:1})
    }

    changeID(){
        this.setState({step:0, workerID: ''})
    }

    //conditional render - step1 for enter store, step2 for doing stuff
    render() {
        if (this.state.step == 0){
            return(
                <div>
                    <h1 className = 'scHeader'>Deliver Get It Today Items</h1>
                    <br/><br/>
                    <p>Enter your worker ID below</p>
                    <input type = 'text' value = {this.state.workerID} onChange = {this.handleWorkerID}></input>
                    <button onClick = {this.selectFulfillments}>SUBMIT</button>
                    <br/><br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
        else if (this.state.step == 1){
            return(
                <div>
                    <h1 className = 'scHeader'>Deliver Get It Today Items</h1>
                    <br/>
                    <p className = 'workerID'>Logged in as: #{this.state.workerID} <br/>
                    <button onClick = {this.changeID}>LOGOUT</button>
                    </p>
                    <br/>
                    <button onClick = {this.props.back}>BACK</button>
                </div>
            )
        }
    }
}

export default deliverItems;