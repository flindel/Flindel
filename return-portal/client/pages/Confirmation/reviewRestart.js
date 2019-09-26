"use strict";
import React, { Component } from "react";
import "./universal.css";
import RestartPop from "./restartPop";
import PriceDisplay from "./finalConfirmation.js";

class ReviewRestart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.code,
      orderNum: this.props.orderNum,
      email: this.props.email,
      //items: [],
      showPop: false
    };
    //items = this.props.items
    this.setState = this.setState.bind(this);
    this.handlePopupDelete = this.handlePopupDelete.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
  }

  //flip between show/not show popup
  togglePopup() {
    this.setState({
      showPop: !this.state.showPop
    });
  }

  //customer wants to restart return,feeds back to master to delete old + continue new
  handlePopupDelete(e) {
    this.props.restartReturn(
      this.state.orderNum,
      this.state.email,
      this.state.code
    );
  }

  //Used to check if restart info matchs with shopify api order info
  // componentDidMount(){
  //     console.log(this.props)
  // }

  render() {
    return (
      <div className="pageReviewRestart">
        <div className="centre">
          <h2 className="r2">Your return request has been received. </h2>
          <div className="reviewInfo">
            <p>
              Order Number: <strong>{this.state.orderNum}</strong> Confirmation
              Code: <strong>{this.state.code}</strong>
            </p>
          </div>
          <PriceDisplay
            serveoname={this.props.serveoname}
            items={this.props.items}
            orderNum={this.state.orderNum}
            review={true}
            shop={this.props.shop}
          />
          <p className="reviewInfo2">
            If you would like to delete your current return and create a new
            return for Order #{this.state.orderNum}, please click the delete
            button below:
          </p>
          <button className="Submit2 Small" onClick={this.togglePopup}>
            DELETE + RESTART
          </button>
          <p className="reviewInfo2">
            Or, to make a return for a different order, please click below to be
            redirected to the beginning of the return portal.
          </p>
          <button className="Submit2 Small" onClick={this.props.restart}>
            BACK
          </button>
          <br />
          <br />
        </div>
        {this.state.showPop ? (
          <RestartPop
            closePopup={this.togglePopup}
            handleDelete={this.handlePopupDelete}
          />
        ) : null}
      </div>
    );
  }
}

export default ReviewRestart;
