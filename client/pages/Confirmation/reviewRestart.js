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

    //flip between show/not show popup
    togglePopup(){
        this.setState({
            showPop:!this.state.showPop
        })
    }

    //customer wants to restart return,feeds back to master to delete old + continue new
    handlePopupDelete(e){
        this.props.restartReturn(this.state.orderNum, this.state.email, this.state.code)
    }

    render(){
        return (
            <div className = 'pageReviewRestart'>
                <div className = 'centre'>
                    <h2 className = 'r2' >You already made a return for this order! Your confirmation code is: {this.state.code}</h2>
                    <br/><br/>
                    <p>If you would like to delete your current return and create a new return for Order #{this.state.orderNum}, please click the delete button below:</p>
                    <br/>
                    <button className = 'r2'onClick={this.togglePopup}>DELETE + RESTART</button>
                    <br/><br/><br/><br/><br/><br/><br/><br/>
                    <p>Or, to make a return for a different order, please click below to be redirected to the beginning of the return portal.</p>
                    <br/>
                    <button className = 'r2Home'onClick = {this.props.restart}>BACK</button>
                </div>
                    {
                    this.state.showPop ?
                    <RestartPop closePopup = {this.togglePopup} handleDelete = {this.handlePopupDelete}/>: null
                    }
            </div>
        )
    }
}

export default ReviewRestart