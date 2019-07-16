import React, { Component } from 'react';
import './universal.css'
import RestartPop from './restartPop'

class ReviewRestart extends Component {
    constructor(props){
        super(props)
        this.state = {
            code: this.props.code,
            orderNum: this.props.orderNum,
            email: this.props.email,
            showPop: false
        }
        this.setState = this.setState.bind(this)
        this.handlePopupDelete = this.handlePopupDelete.bind(this)
        this.togglePopup = this.togglePopup.bind(this)
    }

    togglePopup(){
        this.setState({
            showPop:!this.state.showPop
        })
    }

    handlePopupDelete(e){
        this.props.restartReturn(this.state.orderNum, this.state.email, this.state.code)
    }

    render(){
        return (
            <div className = 'pageReviewRestart'>
                <h3 >Your return is in Process</h3>
                <fieldset>
                <h3>Your confirmation code is: {this.state.code}</h3>
                <br/>
                <p>If you want to delete your current return and start a new one, please click the delete button below</p>
                <button onClick={this.togglePopup}>Delete</button>
                {
                    this.state.showPop ?
                    <RestartPop closePopup = {this.togglePopup} handleDelete = {this.handlePopupDelete}/>: null
                }
                </fieldset>
            </div>
        )
    }
}

export default ReviewRestart
