import React, { Component } from 'react';
import './universal.css'

class ReviewRestart extends Component {
    constructor(props){
        super(props)
        this.state = {
            code: this.props.code,
            orderNum: this.props.orderNum,
            email: this.props.email
        }
        this.setState = this.setState.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e){
        this.props.restartReturn(this.state.orderNum, this.state.email, this.state.code)
    }

    render(){
        return (
            <div>
                <h3 className = 'pageTitleReviewRestart'>Your return is in Process</h3>
                <fieldset className = 'pageReviewRestart'>
                <h3>Your confirmation code is: {this.state.code}</h3>
                <br/>
                <p>If you want to change your return, please click the restart button below</p>
                <button onClick={this.handleClick}>Restart</button>
                </fieldset>
            </div>
        )
    }
}

export default ReviewRestart