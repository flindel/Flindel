"use strict";
import React, { Component } from "react";
import "./universal.css";
import "./flindelInterface.css";
import Order from "./finalConfirmation";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class DropOff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: "",
      code: "",
      step: 0,
      workerID: "",
      items: [],
      errorMessage: "",
      history: ""
    };
    this.selectOrder = this.selectOrder.bind(this);
    this.handleWorkerID = this.handleWorkerID.bind(this);
    this.changeID = this.changeID.bind(this);
    this.handleCode = this.handleCode.bind(this);
    this.viewReturn = this.viewReturn.bind(this);
    this.getItems = this.getItems.bind(this);
    this.receiveOrder = this.receiveOrder.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateDB = this.updateDB.bind(this);
    this.loadHistory = this.loadHistory.bind(this);
  }

  //input worker id on login screen
  handleWorkerID(e) {
    this.setState({ workerID: e.target.value });
  }

  //get history of orders
  async loadHistory() {
    let temp = await fetch(
      `${API_URL}/return/dropoffSummary?id=${encodeURIComponent(
        this.state.workerID
      )}`,
      {
        method: "get"
      }
    );
    let res = await temp.json();
    let allOrders = "";
    //add all codes to list to display
    for (var i = 0; i < res.codes.length; i++) {
      allOrders += res.codes[i] + " , ";
    }
    this.setState({ history: allOrders });
  }

  //log in
  async selectOrder() {
    if (this.state.workerID != "") {
      //check to make sure id is valid
      let temp = await fetch(
        `${API_URL}/worker/check?id=${encodeURIComponent(
          this.state.workerID
        )}`,
        {
          method: "get"
        }
      );
      let isValid = await temp.json();
      if (isValid) {
        //id is valid, load history and let select items
        this.loadHistory();
        this.setState({ step: 1, errorMessage: "", code: "" });
      } else {
        //error message
        this.setState({ errorMessage: "Invalid worker ID." });
      }
    } else {
      //error message
      this.setState({ errorMessage: "Invalid worker ID." });
    }
  }

  //show order had been received
  receiveOrder() {
    this.updateDB();
    this.setState({ step: 4 });
  }

  //log out
  changeID() {
    this.setState({ step: 0, workerID: "" });
  }

  //handle input of return code
  handleCode(e) {
    let temp = e.target.value.toUpperCase();
    this.setState({ code: temp });
  }

  updateDB() {
    //update database when order is received
    fetch(
      `${API_URL}/return/requested/receive?code=${encodeURIComponent(
        this.state.code
      )}&workerID=${encodeURIComponent(this.state.workerID)}`,
      {
        method: "put"
      }
    );
  }

  //when button is pressed to receive orders
  handleSubmit() {
    this.selectOrder();
  }

  async getItems() {
    //fetch items when code is inputted
    let temp = await fetch(
      `${API_URL}/return/requested/items?code=${encodeURIComponent(
        this.state.code
      )}`,
      {
        method: "get"
      }
    );
    let t2 = await temp.json();
    if (t2.valid == true) {
      //if code is valid
      let tempList = [];
      for (var i = 0; i < t2.res.items.arrayValue.values.length; i++) {
        let tempItem = {
          title:
            t2.res.items.arrayValue.values[i].mapValue.fields.name.stringValue,
          variantTitle: "",
          value: 1,
          productID:
            t2.res.items.arrayValue.values[i].mapValue.fields.productid
              .stringValue,
          reason:
            t2.res.items.arrayValue.values[i].mapValue.fields.reason.stringValue
        };
        tempList.push(tempItem);
      }
      this.setState({
        items: tempList,
        step: 2,
        storeName: t2.res.shop.stringValue
      });
    } else {
      //if code isn't valid
      this.setState({
        errorMessage: "No return exists under this code",
        code: ""
      });
    }
  }

  viewReturn() {
    this.getItems();
  }

  //conditional render - step1 for enter store, step2 for doing stuff
  render() {
    if (this.state.step == 0) {
      return (
        <div>
          <h1 className="scHeader">Drop Off Worker</h1>
          <br />
          <br />
          <p>Enter your worker ID below</p>
          <p className="errorMessage">{this.state.errorMessage}</p>
          <input
            type="text"
            value={this.state.workerID}
            onChange={this.handleWorkerID}
          ></input>
          <button onClick={this.selectOrder}>SUBMIT</button>
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    } else if (this.state.step == 1) {
      return (
        <div>
          <h1 className="scHeader">Drop Off Worker (F Shirt)</h1>
          <br />
          <p className="workerID">
            Logged in as: #{this.state.workerID} <br />
            <button onClick={this.changeID}>LOGOUT</button>
          </p>
          <p>Enter confirmation code below</p>
          <input
            type="text"
            value={this.state.code}
            onChange={this.handleCode}
          ></input>
          <button onClick={this.viewReturn}>SUBMIT</button>
          <br />
          <p className="errorMessage">{this.state.errorMessage}</p>
          <br /> <br />
          <br />
          <br />
          <p className="itemHeader">TODAY'S ORDERS</p>
          <p>{this.state.history}</p>
          <br />
          <br />
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    } else if (this.state.step == 2) {
      return (
        <div>
          <h1 className="scHeader">Drop Off Worker</h1>
          <br />
          <p className="workerID">Logged in as: #{this.state.workerID}</p>
          <p className="itemHeader">
            Currently viewing return code: {this.state.code}
          </p>
          <Order
            items={this.state.items}
            orderNum={this.state.orderNum}
            shop={this.state.storeName}
            review={true}
          />
          <button onClick={this.selectOrder}>BACK</button>
          <button onClick={this.receiveOrder}>RECEIVE ORDER</button>
        </div>
      );
    } else if (this.state.step == 4) {
      return (
        <div>
          <h1 className="scHeader">Drop Off Worker</h1>
          <br />
          <p className="workerID">Logged in as: #{this.state.workerID}</p>
          <p className="itemHeader">
            You have marked return {this.state.code} as received.
          </p>
          <br />
          <br />
          <button onClick={this.handleSubmit}>HOME</button>
        </div>
      );
    }
  }
}

export default DropOff;
