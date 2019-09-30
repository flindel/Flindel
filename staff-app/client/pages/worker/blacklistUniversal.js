"use strict";
import React, { Component } from "react";
import "./universal.css";
import Select from "react-select";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

//for error message - allows page to stand alone
const myStyle = {
  color: "red"
};

class Blacklist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: "",
      step: 1,
      items: [],
      deleteItems: [],
      addItems: [],
      addIn: "",
      deleteIn: "",
      errorMessage: "",
      loginMessage: "",
      valid: 0,
      stores: [],
      activeStore: []
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.getItems = this.getItems.bind(this);
    this.handleChangeAdd = this.handleChangeAdd.bind(this);
    this.handleChangeDelete = this.handleChangeDelete.bind(this);
    this.addToBlacklist = this.addToBlacklist.bind(this);
    this.deleteFromBlacklist = this.deleteFromBlacklist.bind(this);
    this.restart = this.restart.bind(this);
    this.doesProductExist = this.doesProductExist.bind(this);
  }

  restart() {
    this.setState({
      storeName: "",
      step: 1,
      items: [],
      deleteItems: [],
      addItems: [],
      addIn: "",
      deleteIn: "",
      errorMessage: "",
      loginMessage: "",
      valid: 0
    });
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

  //input field for entering store name at beginning of process
  handleStoreChange(option) {
    this.setState(state => {
      return {
        activeStore: option
      };
    });
    this.setState({ storeName: option.value });
  }

  //input field for entering id of item to add
  handleChangeAdd(e) {
    this.setState({ addIn: e.target.value });
  }

  //input field for entering id of item to delete
  handleChangeDelete(e) {
    this.setState({ deleteIn: e.target.value });
  }
  //check if product actually exists
  async doesProductExist(ID) {
    let valid = false;
    let temp = await fetch(
      `${API_URL}/products?shop=${encodeURIComponent(
        this.state.storeName
      )}&id=${encodeURIComponent(ID)}`,
      {
        method: "get"
      }
    );
    let response = await temp.json();
    if (response) {
      valid = true;
    } else {
      let temp2 = await fetch(
        `${API_URL}/products/variant/exists?store=${encodeURIComponent(
          this.state.storeName
        )}&id=${encodeURIComponent(ID)}`,
        {
          method: "get"
        }
      );
      let response2 = await temp2.json();
      if (response2) {
        valid = true;
      }
    }
    return valid;
  }

  //add item to blacklist (on submit of add)
  async addToBlacklist() {
    if (this.state.valid) {
      //make sure previous error message goes away
      this.setState({ errorMessage: "" });
      let toAdd = this.state.addIn;
      this.setState({ addIn: "" });
      let tempList = this.state.items;
      //make sure item doesn't exist so we're not making a duplicate
      if (tempList.indexOf(toAdd) == -1) {
        let productExists = await this.doesProductExist(toAdd);
        if (productExists) {
          tempList.push(toAdd);
          tempList.sort();
          let itemString = JSON.stringify(tempList);
          //save to db
          this.setState({ items: tempList });
          fetch(
            `${API_URL}/blacklist?items=${encodeURIComponent(
              itemString
            )}&store=${encodeURIComponent(this.state.storeName)}`,
            {
              method: "put"
            }
          );
        } else {
          this.setState({
            errorMessage: "This ID does not correspond to an actual product."
          });
        }
      }
      //show error message if they enter duplicate
      else {
        this.setState({
          errorMessage: "This item is already on the blacklist."
        });
      }
    }
  }

  //delete an item from blacklist (on submit of delete)
  deleteFromBlacklist() {
    if (this.state.valid) {
      //make sure previous error message goes away
      this.setState({ errorMessage: "" });
      let toDelete = this.state.deleteIn;
      this.setState({ deleteIn: "" });
      let found = false;
      let tempList = this.state.items;
      //make sure there's something there to delete
      for (var i = 0; i < tempList.length; i++) {
        if (tempList[i] == toDelete) {
          found = true;
          tempList.splice(i, 1);
        }
      }
      //show error message if they make mistake
      if (found == false) {
        this.setState({
          errorMessage: "This item is not currently on the blacklist."
        });
      }
      let itemString = JSON.stringify(tempList);
      //save to db
      this.setState({ items: tempList });
      fetch(
        `${API_URL}/blacklist?items=${encodeURIComponent(
          itemString
        )}&store=${encodeURIComponent(this.state.storeName)}`,
        {
          method: "put"
        }
      );
    }
  }

  //handle submit of store name - very beginning
  async handleSubmit() {
    let temp = this.state.storeName;
    temp += ".myshopify.com";
    await this.setState({ storeName: temp.toLowerCase(), step: 2 });
    this.getItems();
  }

  //get items on blacklist of current store
  async getItems() {
    let temp = await fetch(
      `${API_URL}/blacklist?store=${encodeURIComponent(
        this.state.storeName
      )}`,
      {
        method: "get"
      }
    );
    let json = await temp.json();
    if (json.res.length == 0) {
      this.setState({
        step: 1,
        storeName: "",
        loginMessage: "This store does not exist."
      });
    } else {
      this.setState({ valid: 1, loginMessage: "", items: json.res.sort() });
    }
  }

  //conditional render - step1 for enter store, step2 for doing stuff
  render() {
    if (this.state.step == 1) {
      return (
        <div>
          <h1 className="scHeader">Blacklist</h1>
          <br></br>
          <div className="workerStoreBar">
            <Select
              placeholder={"Select store..."}
              isSearchable={false}
              value={this.state.activeStore}
              options={this.state.stores}
              onChange={this.handleStoreChange}
            />
          </div>
          <br />
          <button onClick={this.handleSubmit}>SUBMIT</button>
          <br />
          <br />
          <p style={myStyle}>{this.state.loginMessage}</p>
          <br />
          <br />
          <br />
          <br />
          <button onClick={this.props.back}>BACK</button>
        </div>
      );
    }
    if (this.state.step == 2) {
      return (
        <div>
          <h1 className="scHeader">Blacklist - {this.state.storeName} </h1>
          <br />
          <label>
            Add item (ID):
            <input
              value={this.state.addIn}
              onChange={this.handleChangeAdd}
              type="text"
            ></input>
          </label>
          <button onClick={this.addToBlacklist}>ADD</button>
          <label>
            {" "}
            Delete item (ID):
            <input
              onChange={this.handleChangeDelete}
              value={this.state.deleteIn}
              type="text"
            ></input>
          </label>
          <button onClick={this.deleteFromBlacklist}>DELETE</button>
          <br />
          <br />
          <p style={myStyle}>{this.state.errorMessage}</p>
          <br />
          <p>The following items are currently on the blacklist.</p>
          <p>
            If these items are returned, they will not be made available
            immediately for resale, and will be eventually shipped back to the
            distributor.
          </p>
          <br />
          <div>
            {this.state.items.map((curr, index) => (
              <p>
                {index + 1} - {curr}
              </p>
            ))}
          </div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <button onClick={this.restart}>BACK</button>
        </div>
      );
    }
  }
}

export default Blacklist;
