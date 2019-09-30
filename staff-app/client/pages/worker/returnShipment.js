"use strict";
import React, { Component } from "react";
import "./universal.css";
import "./flindelInterface.css";
import Select from "react-select";
import Item from "./itemSC";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class returnShipment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      store: "",
      items: [],
      returnList: [],
      start: true,
      code: "",
      existing: "",
      existingBrand: "",
      stores: [],
      activeStore: []
    };
    this.goBeginning = this.goBeginning.bind(this);
    this.selectItems = this.selectItems.bind(this);
    this.handleStoreSelect = this.handleStoreSelect.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.goConfirmation = this.goConfirmation.bind(this);
    this.confirmReturn = this.confirmReturn.bind(this);
    this.sendEmails = this.sendEmails.bind(this);
    this.updateDB = this.updateDB.bind(this);
    this.generateCode = this.generateCode.bind(this);
    this.isCodeUnique = this.isCodeUnique.bind(this);
    this.confirmShipment = this.confirmShipment.bind(this);
    this.handleChangeExisting = this.handleChangeExisting.bind(this);
    this.handleStoreChange = this.handleStoreChange.bind(this);
  }
  //go back to beinning
  goBeginning() {
    this.setState({ step: 1, store: "" });
  }

  handleStoreChange(option) {
    this.setState(state => {
      return {
        activeStore: option
      };
    });
    this.setState({ store: option.value + ".myshopify.com" });
  }

  //go to confirmation page
  goConfirmation() {
    let tempList = this.state.items;
    let returnList = [];
    let valid = true;
    //make sure all quantities are valid
    for (var i = 0; i < tempList.length; i++) {
      if (tempList[i].value > tempList[i].quantity) {
        valid = false;
      }
      if (tempList[i].value > 0) {
        returnList.push(tempList[i]);
      }
    }
    if (valid) {
      //make sure something was selected
      if (returnList.length != 0) {
        this.setState({ step: 3, returnList: returnList });
      } else {
        //error message
        alert("Cannot proceed with an empty list");
      }
    } else {
      //error message
      alert(
        "You cannot return more items than are in the warehouse. Please check again"
      );
    }
  }

  handleChangeExisting(e) {
    this.setState({ existing: e.target.value.toUpperCase() });
  }

  async confirmShipment() {
    let temp = await fetch(
      `${API_URL}/item/confirmDelivery?code=${encodeURIComponent(
        this.state.existing
      )}`,
      {
        method: "put"
      }
    );
    let tJSON = await temp.json();
    if (tJSON.store != "") {
      this.setState({ step: 5, existingBrand: tJSON.store });
    } else {
      this.setState({ existing: "" });
      alert("There is no active return associated with this code.");
    }
  }

  //after store is selected, continue
  selectItems() {
    if (this.state.store != "") {
      if (this.state.start) {
        this.loadItems();
        this.setState({ start: false });
      }
      this.setState({ step: 2 });
    }
  }

  async isCodeUnique(code) {
    let temp = await fetch(
      `${API_URL}/item/code/unique?code=${encodeURIComponent(code)}`,
      {
        method: "get"
      }
    );
    let tJSON = await temp.json();
    return tJSON.valid;
  }

  async generateCode() {
    //alphabet, vowels removed for censoring
    const alphabet = "BCDFGHJKLMNPQRSTVWXZ123456789";
    const codeLength = 6;
    let code = "";
    for (var i = 0; i < codeLength; i++) {
      let index = Math.floor(Math.random() * alphabet.length);
      code += alphabet[index];
      //search here instead of manually setting
    }
    let valid = await this.isCodeUnique(code);
    if (valid) {
      this.setState({ code: code });
    } else {
      await this.generateCode();
    }
  }
  //when entire return is confirmed
  async confirmReturn() {
    await this.generateCode();
    //this.sendEmails()
    this.updateDB();
    this.setState({ step: 4 });
  }

  sendEmails() {
    //send email to flindel and brand about items
    let itemString = JSON.stringify(this.state.returnList);
    fetch(
      `${API_URL}/send/returnShipment?code=${encodeURIComponent(
        this.state.code
      )}&store=${encodeURIComponent(
        this.state.store
      )}&items=${encodeURIComponent(itemString)}`,
      {
        method: "post"
      }
    );
  }

  updateDB() {
    //update items in db from returning to returned
    for (var i = 0; i < this.state.returnList.length; i++) {
      let tempItem = this.state.returnList[i];
      let qty = tempItem.value;
      let id = tempItem.variantid;
      fetch(
        `${API_URL}/item/returned?quantity=${encodeURIComponent(
          qty
        )}&code=${encodeURIComponent(
          this.state.code
        )}&store=${encodeURIComponent(
          this.state.store
        )}&id=${encodeURIComponent(id)}`,
        {
          method: "put"
        }
      );
    }
  }

  //change store from dropdown menu
  handleStoreSelect(e) {
    this.setState({ store: e.target.value });
  }

  //change quantity of returning (parent fn)
  handleQuantityChange(index, numIn) {
    let tempList = this.state.items;
    if (numIn == "") {
      tempList[index].value = numIn;
    }
    //make sure it is an integer with regex
    else if (
      numIn.toString()[numIn.toString().length - 1].match("-?(0|[1-9]\\d*)")
    ) {
      tempList[index].value = numIn;
    }
    this.setState({ items: tempList });
  }

  //load items when store is selected
  async loadItems() {
    let temp = await fetch(
      `${API_URL}/item/storeList?store=${encodeURIComponent(
        this.state.store
      )}`,
      {
        method: "get"
      }
    );
    let items = await temp.json();
    for (var i = 0; i < items.length; i++) {
      for (var j = i + 1; j < items.length; j++) {
        //combine quantities so there are no duplicates
        if (items[i].variantid == items[j].variantid) {
          items[i].quantity++;
          items.splice(j, 1);
          j--;
        }
      }
    }
    for (var i = 0; i < items.length; i++) {
      items[i].index = i;
      items[i].store = this.state.store;
      items[i].productid = items[i].productID;
    }
    this.setState({ items: items });
  }

  async componentDidMount() {
    let temp = await fetch(`${API_URL}/shop/all`, {
      method: "get"
    });
    let tJSON = await temp.json();
    let stores = [];
    for (var i = 0; i < tJSON.length; i++) {
      let tempStore = {
        value: tJSON[i],
        label: tJSON[i] + ".myshopify.com"
      };
      stores.push(tempStore);
    }
    this.setState({ stores: stores });
  }

  //conditional render - step1 for enter store, step2 for doing stuff
  render() {
    if (this.state.step == 1) {
      return (
        <div>
          <h1 className="scHeader">RETURN SHIPMENT</h1>
          <br />
          <h4>Please select desired store from the list below.</h4>
          <br />
          <div className="workerStoreBar">
            <Select
              placeholder={"Select store..."}
              isSearchable={false}
              value={this.state.activeStore}
              options={this.state.stores}
              onChange={this.handleStoreChange}
            />
          </div>
          <button onClick={this.selectItems}>SUBMIT</button>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <p>
            After receiving confirmation from a partner that a shipment arrived,
            please enter the code below.
          </p>
          <input
            value={this.state.existing}
            onChange={this.handleChangeExisting}
          />
          <button onClick={this.confirmShipment}>CONFIRM SHIPMENT</button>
          <br />
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
          <h1 className="scHeader">RETURN SHIPMENT</h1>
          <br />
          <h4 className="scHeader">Store: {this.state.store}</h4>
          <br />
          <br />
          <fieldset className="Return">
            <div className="itemContainerSC">
              <div className="containerReturnHeader">
                <p className="itemHeader">IMAGE</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader"> NAME </p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">VARIANT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">PRODUCT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">QUANTITIES</p>
              </div>
            </div>
            {this.state.items.map(item => {
              return (
                <Item
                  item={item}
                  handleQuantityChange={this.handleQuantityChange.bind(this)}
                  step={6}
                  key={item.variantid}
                />
              );
            })}
          </fieldset>
          <br />
          <br />
          <button onClick={this.goBeginning}>BACK</button>
          <button onClick={this.goConfirmation}>CONTINUE</button>
        </div>
      );
    } else if (this.state.step == 3) {
      return (
        <div>
          <h1 className="scHeader">RETURN SHIPMENT</h1>
          <br />
          <h4 className="scHeader">Store: {this.state.store}</h4>
          <br />
          <h4 className="scHeader">Confirmation</h4>
          <br />
          <fieldset className="Return">
            <div className="itemContainerSC">
              <div className="containerReturnHeader">
                <p className="itemHeader">IMAGE</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader"> NAME </p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">VARIANT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">PRODUCT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="containerReturnHeader">
                <p className="itemHeader">QTY RETURNING</p>
              </div>
            </div>
            {this.state.returnList.map(item => {
              return (
                <Item
                  item={item}
                  handleQuantityChange={this.handleQuantityChange.bind(this)}
                  step={7}
                  key={item.variantid}
                />
              );
            })}
          </fieldset>
          <br />
          <button onClick={this.selectItems}>BACK</button>
          <button onClick={this.confirmReturn}>CONFIRM</button>
        </div>
      );
    } else if (this.state.step == 4) {
      return (
        <div>
          <h1 className="scHeader">RETURN SHIPMENT</h1>
          <br />
          <h4 className="scHeader">Store: {this.state.store}</h4>
          <br />
          <p>
            This return has been confirmed and {this.state.store} has been
            notified of the shipment.
          </p>
          <br />
          <p>The code for this return is: {this.state.code}</p>
          <br />
          <br />
          <button onClick={this.goBeginning}>HOME</button>
        </div>
      );
    } else if (this.state.step == 5) {
      return (
        <div>
          <h1 className="scHeader">RETURN SHIPMENT</h1>
          <br />
          <br />
          <p>
            You have marked that return #{this.state.existing} was successfully
            delivered and received by {this.state.existingBrand}.
          </p>
          <br />
          <br />
          <button onClick={this.goBeginning}>HOME</button>
        </div>
      );
    }
  }
}

export default returnShipment;
