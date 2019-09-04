import React, { Component } from "react";
import getConfig from "next/config";
//import {serveo_name} from '../config'
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;
let api_name = API_URL;
import { getShopID } from "./Shopify";

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
      errorMessage: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getItems = this.getItems.bind(this);
    this.handleChangeAdd = this.handleChangeAdd.bind(this);
    this.handleChangeDelete = this.handleChangeDelete.bind(this);
    this.addToBlacklist = this.addToBlacklist.bind(this);
    this.deleteFromBlacklist = this.deleteFromBlacklist.bind(this);
    getShopID(this.handleSubmit);
  }
  handleInputChange(e) {
    this.setState({ storeName: e.target.value });
  }
  handleChangeAdd(e) {
    this.setState({ addIn: e.target.value });
  }
  handleChangeDelete(e) {
    this.setState({ deleteIn: e.target.value });
  }
  async doesProductExist(ID) {
    let temp = await fetch(
      `${api_name}/products?shop=${encodeURIComponent(
        this.state.storeName
      )}&id=${encodeURIComponent(ID)}`,
      {
        method: "get"
      }
    );
    let response = await temp.json();
    if (response) {
      response = true;
    }
    return response;
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
            `${api_name}/blacklist?items=${encodeURIComponent(
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
        `${api_name}/blacklist?items=${encodeURIComponent(
          itemString
        )}&store=${encodeURIComponent(this.state.storeName)}`,
        {
          method: "put"
        }
      );
    }
  }

  async handleSubmit(storeName) {
    const temp = storeName.shop_id;
    console.log("storeName:", temp);
    await this.setState({ storeName: temp.toLowerCase(), step: 2 });
    this.getItems();
  }

  //get items on blacklist of current store
  async getItems() {
    let temp = await fetch(
      `${api_name}/blacklist?store=${encodeURIComponent(this.state.storeName)}`,
      {
        method: "get"
      }
    );
    let json = await temp.json();
    if (json.res.length == 0) {
      this.setState({ loginMessage: "THIS STORE DOES NOT EXIST" });
    } else {
      this.setState({ valid: 1, loginMessage: "", items: json.res.sort() });
    }
  }

  render() {
    if (this.state.step == 1) {
      return (
        <div>
          <h1>Loading Blacklist</h1>
        </div>
      );
    }
    if (this.state.step == 2) {
      return (
        <div>
          <p>{this.state.storeName} Blacklist</p>
          <br />
          <label>
            Add item:
            <input
              value={this.state.addIn}
              onChange={this.handleChangeAdd}
              type="text"
            ></input>
          </label>
          <button onClick={this.addToBlacklist}>ADD</button>
          <label>
            {" "}
            Delete item:
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
          <div>
            {this.state.items.map((curr, index) => (
              <p>
                {index + 1} - {curr}
              </p>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p>bad</p>
        </div>
      );
    }
  }
}
export default Blacklist;
