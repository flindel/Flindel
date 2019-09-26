"use strict";
import React, { Component } from "react";
import "./universal.css";

/* SEARCH PAGE
First page customers sees, prompts them to input order num+other identifier
*/

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailAdd: "",
      orderNum: "",
      //button is blacked out at beginning, can't submit until they have both fields filled out
      style: "Blackout1",
      showOrderNumberInfo: false,
      showEmailInfo: false
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleOrderNumChange = this.handleOrderNumChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.checkButton = this.checkButton.bind(this);
    this.showEmailInfo = this.showEmailInfo.bind(this);
    this.showOrderNumberInfo = this.showOrderNumberInfo.bind(this);
  }

  //toggle instruction for email address and phone number
  showEmailInfo(e) {
    this.setState({
      showEmailInfo: !this.state.showEmailInfo
    });
  }

  //toggle instruction for order number
  showOrderNumberInfo(e) {
    this.setState({
      showOrderNumberInfo: !this.state.showOrderNumberInfo
    });
  }

  //handle input of order num
  handleOrderNumChange(e) {
    this.setState({
      orderNum: e.target.value
    });
    this.checkButton();
  }

  //handle input of email address
  handleEmailChange(e) {
    this.setState({
      emailAdd: e.target.value
    });
    this.checkButton();
  }

  //check to see each time they enter something if the button should flip from (un)available
  checkButton() {
    alert;
    if (this.state.emailAdd != "" && this.state.orderNum != "") {
      this.setState({ style: "Submit1" });
    } else {
      this.setState({ style: "Blackout1" });
    }
  }

  //handle submit
  handleSearch(e) {
    this.props.identifyItems(this.state.orderNum, this.state.emailAdd, true); //true means function will call Database check if this return exist
    //event.preventDefault();
  }

  render() {
    return (
      <div className="Search">
        <div className="Search-fields">
          <fieldset className="page1">
            <div className="Search-block">
              {/* {<p className = 'label'>Order Number: </p>} */}
              <input
                type="text"
                className="p1"
                placeholder="Order Number"
                onChange={this.handleOrderNumChange}
              />
              <span onClick={this.showOrderNumberInfo}>
                <img src="https://drive.google.com/uc?id=1muURA-zh3cbC2WLT0gX8nLRYLPilQujh" />
              </span>
              {this.state.showOrderNumberInfo ? (
                <p>Your order number can be found in your confirmation email</p>
              ) : null}
            </div>
            <br></br>
            <div className="Search-block">
              {/* {<p className = 'label'>Email Address or Phone Number:  </p>} */}
              <input
                type="text"
                className="p1"
                placeholder="Email or Phone Number"
                onChange={this.handleEmailChange}
              />
              <span onClick={this.showEmailInfo}>
                <img src="https://drive.google.com/uc?id=1muURA-zh3cbC2WLT0gX8nLRYLPilQujh" />
              </span>
              {this.state.showEmailInfo ? (
                <p>
                  This is the email or phone number associated with your order
                </p>
              ) : null}
            </div>

            <br />
            <div className="Search-submit">
              <button
                className={this.state.style}
                type="submit"
                onClick={this.handleSearch}
              >
                {" "}
                Begin{" "}
              </button>
            </div>
          </fieldset>
        </div>
      </div>
    );
  }
}

export default Search;
