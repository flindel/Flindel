import React, { Component } from 'react';
import './universal.css';

class restartPop extends Component {
    constructor(props){
        super(props)
        this.state = {

        }

    }

    render(){
        return (
        <div className = 'popup'>
            <div className = 'popup_inner'>
                <h1>DELETE WARNING</h1>
                <p>If you click delete button, your current return form will be deactivated and deleted, then you can submit a new return form, do you really want to delete the current one?</p>
                <button className='cancel-delete' onClick={this.props.closePopup}>No, keep my current return form</button>
                <button className='delete' onClick = {this.props.handleDelete}>DELETE and START a new return</button>
            </div>
        </div>
        )
    }
}

export default restartPop
