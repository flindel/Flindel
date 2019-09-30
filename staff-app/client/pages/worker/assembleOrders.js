"use strict";
import React, { Component } from "react";
import "./universal.css";
import "./flindelInterface.css";
import Order from "./order";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class assembleOrders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      workerID: "1",
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
    this.changeItemStatus = this.changeItemStatus.bind(this);
    this.changeDriverID = this.changeDriverID.bind(this);
  }

  //automatically load all orders when page loads
  componentDidMount() {
    this.loadFulfillments();
  }

  //edit the driver ID field
  changeDriverID(index, newID) {
    let tempList = this.state.orderList;
    tempList[index].workerid = newID;
    this.setState({ orderList: tempList });
  }

  //change the message in the textbox
  changeMessage(newMessage, index) {
    let tempList = this.state.orderList;
    tempList[index].comment = newMessage;
    this.setState({ orderList: tempList });
  }

  //not used for now, but handles a login page
  handleWorkerID(e) {
    this.setState({ workerID: e.target.value });
  }

  //submitting changes made
  async handleSubmit() {
    let tempList = this.state.orderList;
    for (var i = 0; i < tempList.length; i++) {
      //these don't need to be written to the db
      delete tempList[i]["index"];
      delete tempList[i]["backgroundColor"];
      for (var j = 0; j < tempList[i].items.length; j++) {
        //this doesn't need to be written to the db
        delete tempList[i].items[j]["index"];
        //make sure variable types are consistent
        tempList[i].items[j].fulfilled = parseInt(
          tempList[i].items[j].fulfilled
        );
        tempList[i].items[j].quantity = parseInt(tempList[i].items[j].quantity);
      }
    }
    //actually update
    let orderString = JSON.stringify(tempList);
    await fetch(
      `${API_URL}/fulfillment/update?orders=${encodeURIComponent(
        orderString
      )}`,
      {
        method: "put"
      }
    );
    this.setState({ step: 2 });
  }

  //update status if individual items and see if this affects the order status
  changeItemStatus(itemIndex, orderIndex, value) {
    let tempList = this.state.orderList;
    tempList[orderIndex].items[itemIndex].fulfilled = value;
    //set to green if good
    if (value == 1) {
      tempList[orderIndex].items[itemIndex].backgroundColor = "itemOrderGreen";
    }
    //set to red if bad
    if (value == -1) {
      tempList[orderIndex].items[itemIndex].backgroundColor = "itemOrderRed";
    }
    //autoset to complete
    tempList[orderIndex].status = "complete";
    let successful = true;
    let failed = true;
    for (var i = 0; i < tempList[orderIndex].items.length; i++) {
      if (tempList[orderIndex].items[i].fulfilled == 0) {
        //if item hasn't been processed, incomplete
        tempList[orderIndex].status = "incomplete";
      }
      //unless all items are 1, it's not fully successful
      if (tempList[orderIndex].items[i].fulfilled != 1) {
        successful = false;
      }
      //unless all items are -1, it's not fully failed
      if (tempList[orderIndex].items[i].fulfilled != -1) {
        failed = false;
      }
    }
    if (successful) {
      tempList[orderIndex].status = "successful";
    } else if (failed) {
      tempList[orderIndex].status = "failed";
    }
    //reset indexes
    for (var i = 0; i < tempList.length; i++) {
      tempList[i].index = i;
    }
    this.setState({ orderList: tempList });
  }

  //change order status (+-)
  changeOrderStatus(index, val) {
    let tempList = this.state.orderList;
    if (val == 1) {
      tempList[index].status = "successful";
      //tempList[index].backgroundColor = 'lightgreen'
      for (var i = 0; i < tempList[index].items.length; i++) {
        tempList[index].items[i].fulfilled = 1;
      }
    } else if (val == 0) {
      tempList[index].status = "incomplete";
      //tempList[index].backgroundColor = ''
      for (var i = 0; i < tempList[index].items.length; i++) {
        tempList[index].items[i].fulfilled = 0;
      }
    } else if (val == -1) {
      tempList[index].status = "failed";
      //tempList[index].backgroundColor = 'lightpink'
      for (var i = 0; i < tempList[index].items.length; i++) {
        tempList[index].items[i].fulfilled = -1;
      }
    }
    //sort list so unfinished is at top
    for (var i = 0; i < tempList.length; i++) {
      for (var j = i + 1; j < tempList.length; j++) {
        if (
          (tempList[i].status == "successful" ||
            tempList[i].status == "complete" ||
            tempList[i].status == "failed") &&
          tempList[j].status == "incomplete"
        ) {
          let tempOrder = tempList[i];
          tempList[i] = tempList[j];
          tempList[j] = tempOrder;
        }
      }
    }
    //re-index after sort
    for (var i = 0; i < tempList.length; i++) {
      tempList[i].index = i;
    }
    this.setState({ orderList: tempList });
  }

  generateCode() {
    const alphabet = "0123456789";
    const codeLength = 5;
    let code = "";
    for (var i = 0; i < codeLength; i++) {
      let index = Math.floor(Math.random() * alphabet.length);
      code += alphabet[index];
      //search here instead of manually setting
    }
    return code;
  }

  async loadFulfillments() {
    //load fulfillments here
    let temp = await fetch(
      `${API_URL}/fulfillment/assemble?workerID=${encodeURIComponent(
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
        backgroundColor: "",
        index: i
      };
      for (var j = 0; j < tJSON[i].items.arrayValue.values.length; j++) {
        let spot = tJSON[i].items.arrayValue.values[j];
        let tempItem = {
          fulfilled: spot.mapValue.fields.fulfilled.integerValue,
          itemid: spot.mapValue.fields.itemid.stringValue,
          name: spot.mapValue.fields.name.stringValue,
          productid: spot.mapValue.fields.productid.stringValue,
          quantity: spot.mapValue.fields.quantity.integerValue,
          variantid: spot.mapValue.fields.variantid.stringValue,
          index: j,
          backgroundColor: "itemOrder"
        };
        if (tempItem.fulfilled == 1) {
          tempItem.backgroundColor = "itemOrderGreen";
        }
        tempOrder.items.push(tempItem);
      }
      //push to master list
      if (tempOrder.code == "") {
        tempOrder.code = this.generateCode();
      }
      orders.push(tempOrder);
    }
    this.setState({ loadingMessage: "", orderList: orders });
  }

  //load fulfillments and edit
  go() {
    this.setState({ step: 1 });
    this.loadFulfillments();
  }

  //logout, not used now but for potential login
  changeID() {
    this.setState({ step: 0, workerID: "" });
  }

  //conditional render : 0 login, 1 action, 2 confirmation
  render() {
    if (this.state.step == 0) {
      return (
        <div>
          <h1 className="scHeader">ASSEMBLE ORDERS</h1>
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
          <h1 className="scHeader">ASSEMBLE ORDERS</h1>
          <br />
          <br />
          <h3 className="subHeader">Today's Orders to Assemble:</h3>
          <br />
          <fieldset className="SC">
            <div className="itemContainerSC">
              <div className="deliveryHeaderS">
                <p className="itemHeader">CODE</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeaderS">
                <p className="itemHeader">INFORMATION </p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeaderS">
                <p className="itemHeader">STORE</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeaderL">
                <p className="itemHeader">ITEMS</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="deliveryHeaderM">
                <p className="itemHeader">COMMENT</p>
              </div>
            </div>
            {this.state.orderList.map((order, index) => {
              return (
                <Order
                  order={order}
                  step={1}
                  changeDriverID={this.changeDriverID.bind(this)}
                  changeItemStatus={this.changeItemStatus.bind(this)}
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
          <h1 className="scHeader">ASSEMBLE ORDERS</h1>
          <br />
          <p className="workerID">
            Logged in as: #{this.state.workerID} <br />
            <button onClick={this.changeID}>LOGOUT</button>
          </p>
          <br />
          <br />
          <p>The changes have been saved</p>
          <br />
          <button onClick={this.go}>CONTINUE ASSEMBLING</button>
          <br />
          <br />
          <button onClick={this.props.back}>EXIT</button>
        </div>
      );
    }
  }
}

export default assembleOrders;
