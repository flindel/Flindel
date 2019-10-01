"use strict";
import React, { Component } from "react";
import "./universal.css";
import "./flindelInterface.css";
import Order from "./order";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class deliverOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      workerID: "",
      orderList: [],
      loadingMessage: "Loading................."
    };
    this.handleWorkerID = this.handleWorkerID.bind(this);
    this.go = this.go.bind(this);
    this.loadFulfillments = this.loadFulfillments.bind(this);
    this.changeID = this.changeID.bind(this);
    this.changeMessage = this.changeMessage.bind(this);
    this.changeOrderStatus = this.changeOrderStatus.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  //edit message
  changeMessage(newMessage, index) {
    let tempList = this.state.orderList;
    tempList[index].comment = newMessage;
    this.setState({ orderList: tempList });
  }

  //change login screen
  handleWorkerID(e) {
    this.setState({ workerID: e.target.value });
  }

  //submit changes
  async handleSubmit() {
    let deliveredList = [];
    let failedList = [];
    for (var i = 0; i < this.state.orderList.length; i++) {
      if (this.state.orderList[i].delivered == 1) {
        //anything that was green
        deliveredList.push(this.state.orderList[i]);
        deliveredList[
          deliveredList.length - 1
        ].deliveredBy = this.state.workerID;
      } else {
        //anything that was red
        failedList.push(this.state.orderList[i]);
      }
    }
    deliveredList = await this.cleanList(deliveredList);
    failedList = await this.cleanList(failedList);
    let orders = JSON.stringify(failedList);
    //send failed deliveries to update
    if (failedList.length > 0) {
      const options = {
        method: "put",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: orders,
      };
      await fetch(
        `${API_URL}/fulfillment/update`,
        options
      );
    }
    orders = JSON.stringify(deliveredList);
    //send successful deliveries to update
    if (deliveredList.length > 0) {
      const options = {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: orders,
      };
      await fetch(
        `${API_URL}/fulfillment/complete`,
        options
      );
    }
    this.setState({ step: 2 });
  }
  //clean up list
  cleanList(tempList) {
    for (var i = 0; i < tempList.length; i++) {
      //get rid of unnecessary information
      delete tempList[i]["index"];
      delete tempList[i]["delivered"];
      for (var j = 0; j < tempList[i].items.length; j++) {
        delete tempList[i].items[j]["index"];
        tempList[i].items[j].fulfilled = parseInt(
          tempList[i].items[j].fulfilled
        );
        tempList[i].items[j].quantity = parseInt(tempList[i].items[j].quantity);
      }
    }
    return tempList;
  }

  //change order status to delivered or not
  changeOrderStatus(index, val) {
    let tempList = this.state.orderList;
    tempList[index].delivered = val;
    for (var i = 0; i < tempList[index].items.length; i++) {
      if (val == 1) {
        tempList[index].items[i].fulfilled = 1;
      } else {
        tempList[index].items[i].fulfilled = 0;
      }
    }
    this.setState({ orderList: tempList });
  }
  async loadFulfillments() {
    //load fulfillments here
    let temp = await fetch(
      `${API_URL}/fulfillment/deliver?workerID=${encodeURIComponent(
        this.state.workerID
      )}`,
      {
        method: "get"
      }
    );
    let tJSON = await temp.json();
    let orders = [];
    //load all orders
    for (var i = 0; i < tJSON.length; i++) {
      let tempOrder = {
        code: tJSON[i].code.stringValue,
        comment: tJSON[i].comment.stringValue,
        dateCreated: tJSON[i].dateCreated.stringValue,
        fulfillmentid: tJSON[i].fulfillmentid.stringValue,
        name: tJSON[i].name.stringValue,
        orderid: tJSON[i].orderid.stringValue,
        shippingAddress: tJSON[i].shippingAddress.stringValue,
        status: tJSON[i].status.stringValue,
        store: tJSON[i].store.stringValue,
        workerid: tJSON[i].workerid.stringValue,
        items: [],
        delivered: 0,
        index: i
      };
      for (var j = 0; j < tJSON[i].items.arrayValue.values.length; j++) {
        let spot = tJSON[i].items.arrayValue.values[j];
        let tempItem = {
          fulfilled: 0,
          itemid: spot.mapValue.fields.itemid.stringValue,
          name: spot.mapValue.fields.name.stringValue,
          productid: spot.mapValue.fields.productid.stringValue,
          quantity: spot.mapValue.fields.quantity.integerValue,
          variantid: spot.mapValue.fields.variantid.stringValue,
          index: j
        };
        tempOrder.items.push(tempItem);
      }
      orders.push(tempOrder);
    }
    this.setState({ loadingMessage: "", orderList: orders });
  }

  //begin delivering
  go() {
    this.setState({ step: 1 });
    this.loadFulfillments();
  }

  //logout button
  changeID() {
    this.setState({ step: 0, workerID: "" });
  }

  //conditional render : 0 login, 1 action, 2 confirmation
  render() {
    if (this.state.step == 0) {
      return (
        <div>
          <h1 className="scHeader">DELIVER ORDERS</h1>
          <br />
          <br />
          <p>Enter your worker ID below</p>
          <input
            type="text"
            value={this.state.workerID}
            onChange={this.handleWorkerID}
          ></input>
          <button onClick={this.go}>SUBMIT</button>
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    } else if (this.state.step == 1) {
      return (
        <div>
          <h1 className="scHeader">DELIVER ORDERS</h1>
          <br />
          <p className="workerID">
            Logged in as: #{this.state.workerID} <br />
            <button onClick={this.changeID}>LOGOUT</button>
          </p>
          <br />
          <h3 className="subHeader">Today's Orders To Deliver:</h3>
          <br />
          <fieldset className="SC">
            <div className="itemContainerSC">
              <div className="deliveryHeader2S">
                <p className="itemHeader">#</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeader2L">
                <p className="itemHeader">INFO</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeader2S">
                <p className="itemHeader">+</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeader2L">
                <p className="itemHeader"></p>
              </div>
            </div>
            {this.state.orderList.map((order, index) => {
              return (
                <Order
                  order={order}
                  step={2}
                  changeOrderStatus={this.changeOrderStatus.bind(this)}
                  changeMessage={this.changeMessage.bind(this)}
                  key={order.code + index}
                />
              );
            })}
            <p>{this.state.loadingMessage}</p>
          </fieldset>
          <br />
          <br />
          <br />
          <br />
          <button onClick={this.handleSubmit}>SAVE</button>
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    } else if (this.state.step == 2) {
      return (
        <div>
          <h1 className="scHeader">DELIVER ORDERS</h1>
          <br />
          <p className="workerID">
            Logged in as: #{this.state.workerID} <br />
            <button onClick={this.changeID}>LOGOUT</button>
          </p>
          <br />
          <br />
          <p>The changes have been saved</p>
          <br />
          <button onClick={this.go}>CONTINUE UPDATING</button>
          <br />
          <br />
          <button onClick={this.props.back}>EXIT</button>
        </div>
      );
    }
  }
}

export default deliverOrders;
