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
        }
        //this.doesProductExist = this.doesProductExist.bind(this)
    }

    //conditional render - step1 for enter store, step2 for doing stuff
    render() {
        return(
            <div>
                <h1 className = 'scHeader'>Deliver Items</h1>
                <br/><br/>
                <button onClick = {this.props.back}>BACK</button>
            </div>
        )
    }
}

export default deliverItems;