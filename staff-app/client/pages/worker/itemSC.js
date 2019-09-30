"use strict";
import React, { Component } from "react";
import "./universal.css";
import Select from "react-select";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class Item extends Component {
  //constructor/binding methods
  constructor(props) {
    super(props);
    this.state = {
      productid: this.props.item.productID,
      variantid: this.props.item.variantID,
      name: this.props.item.name,
      title: this.props.item.title,
      variantTitle: this.props.item.variantTitle,
      value: "0", //the quantity that user wants to return
      src: "",
      blacklist: false,
      blacklistMessage: "",
      reason: this.props.item.reason,
      quantity: this.props.item.quantity, //the quantity of a item that user total brought
      status: this.props.item.status,
      flag: this.props.item.flag,
      idNew: "",
      styleName: "",
      messageOldName: "",
      messageOldVID: "",
      messageOldPID: ""
    };
    this.setState = this.setState.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.quantityUp = this.quantityUp.bind(this);
    this.quantityDown = this.quantityDown.bind(this);
    this.handleNewIDChange = this.handleNewIDChange.bind(this);
    this.makeNewProduct = this.makeNewProduct.bind(this);
    this.getItemInformation = this.getItemInformation.bind(this);
    this.handleQuantityChangeReturn = this.handleQuantityChangeReturn.bind(
      this
    );
    this.checkBlacklist = this.checkBlacklist.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.packageItem = this.packageItem.bind(this);
    this.failItem = this.failItem.bind(this);
  }

  //create new product - first time through, single order
  async makeNewProduct() {
    let [pID, name] = await this.getItemInformation(this.state.idNew);
    if (pID != 0) {
      let temp = await fetch(
        `${API_URL}/products/GITinformation?varID=${encodeURIComponent(
          this.state.idNew
        )}&productID=${encodeURIComponent(pID)}`,
        {
          method: "get"
        }
      );
      let tempJSON = await temp.json();
      let newItem = {
        variantid: this.state.idNew,
        name: name,
        variantidGIT: tempJSON.variant,
        productidGIT: tempJSON.product,
        productid: pID.toString()
      };
      //get GIT information
      this.setState({ idNew: "" });
      //callback to make new product
      this.props.addItem(newItem, this.props.item.index);
    } else {
      alert("THIS IS NOT A VALID VARIANT ID");
    }
  }

  //change input of return for return shipment
  handleQuantityChangeReturn(e) {
    this.props.handleQuantityChange(this.props.item.index, e.target.value);
  }

  //get information
  async getItemInformation(varID) {
    let temp = await fetch(
      `${API_URL}/products/all?shop=${encodeURIComponent(
        this.props.item.store
      )}`,
      {
        method: "get"
      }
    );
    let productID = "0";
    let name = "name";
    let productsJSON = await temp.json();
    for (var i = 0; i < productsJSON.products.length; i++) {
      let tempItem = productsJSON.products[i];
      for (var j = 0; j < tempItem.variants.length; j++) {
        let tempVar = tempItem.variants[j];
        if (tempVar.id == varID) {
          productID = tempVar.product_id;
          name = tempItem.title + " - " + tempVar.title;
        }
      }
    }
    return [productID, name];
  }

  //write in new id
  handleNewIDChange(e) {
    this.setState({ idNew: e.target.value });
  }

  //change status of item (done by sorting center)
  handleStatusChange(e) {
    let newStatus = e.target.value;
    //block blacklisted items from getting accepted
    if (e.target.value == "accepted" && this.state.blacklist == 1) {
      newStatus = "returning";
    }
    this.setState(
      {
        status: newStatus
      },
      () =>
        this.props.handleSelect(
          this.props.item.index,
          newStatus,
          this.props.step
        )
    );
  }

  //set to red (checkover)
  quantityDown() {
    this.props.handleQuantityChange(this.props.item.index, -1);
  }

  //set to green (checkover)
  quantityUp() {
    this.props.handleQuantityChange(this.props.item.index, 1);
  }

  async checkBlacklist() {
    //sorting center interface
    let temp = await fetch(
      `${API_URL}/products/variant/productID?store=${encodeURIComponent(
        this.props.item.store
      )}&id=${encodeURIComponent(this.props.item.variantid)}`,
      {
        method: "get"
      }
    );
    let tJSON = await temp.json();
    let imageID = tJSON.variant.product_id;
    //check if on blacklist
    let temp2 = await fetch(
      `${API_URL}/blacklist/exists?store=${encodeURIComponent(
        this.props.item.store
      )}&id=${encodeURIComponent(imageID)}&id2=${encodeURIComponent(
        this.props.item.variantid
      )}`,
      {
        method: "get"
      }
    );
    let t2JSON = await temp2.json();
    let isOn = 1;
    let message = "(BLACKLISTED)";
    if (t2JSON.blacklist == false) {
      isOn = 0;
      message = "";
    }
    this.setState({ blacklist: isOn, blacklistMessage: message });
  }

  //get product image
  async loadImage() {
    //get image
    let imageID = this.props.item.productid;
    fetch(
      `${API_URL}/products/img?shop=${encodeURIComponent(
        this.props.item.store
      )}&id=${encodeURIComponent(imageID)}`,
      {
        method: "GET"
      }
    )
      .then(response => response.json())
      .then(resData => {
        if (resData.product) {
          if (resData.product.image) {
            this.setState({
              src: resData.product.image.src
            });
          }
        }
      });
  }

  //item is not succesfully assembled, set to red in props
  failItem() {
    this.props.changeItemStatus(this.props.item.index, -1);
  }

  //item is succesfully assembled, set to green in props
  packageItem() {
    this.props.changeItemStatus(this.props.item.index, 1);
  }

  //get messages to go underneath when an item is replaced
  loadMessages() {
    if (this.props.item.flag == "1") {
      let name = "(OLD: " + this.props.item.oldItem.OLDname + ")";
      let vid = "(OLD: " + this.props.item.oldItem.OLDvariantid + ")";
      let pid = "(OLD: " + this.props.item.oldItem.OLDproductid + ")";
      this.setState({
        messageOldName: name,
        messageOldPID: pid,
        messageOldVID: vid
      });
    }
  }

  //on mount, get important information including image source to show the display picture
  componentWillMount() {
    if (this.props.step == 4 || this.props.step == 5) {
      this.checkBlacklist();
      this.loadMessages();
    }
    if (this.props.step != 8) this.loadImage();
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    //first time through sorting center (single order)
    if (this.props.step == 4) {
      return (
        <div className="itemContainerSC">
          <div className="container1SC">
            <hr className="horiz" />
            <img className="item2" src={this.state.src} />
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC"> {this.props.item.name} </p>
            <p className="itemOld"> {this.state.messageOldName}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC">{this.props.item.variantid}</p>
            <p className="itemOld">{this.state.messageOldVID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC">{this.props.item.productid}</p>
            <p className="itemOld">{this.state.messageOldPID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC"> {this.props.item.reason}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <select
              value={this.state.status}
              onChange={this.handleStatusChange}
            >
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted - Resell</option>
              <option value="returning">Accepted - No Resell</option>
              <option value="rejected">Rejected</option>
              <option value="special">Special Circumstances</option>
            </select>
            <p className="item errorMessage">{this.state.blacklistMessage}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container1SC">
            <hr className="horiz" />
            <br />
            <br />
            <input
              onChange={this.handleNewIDChange}
              value={this.state.idNew}
            ></input>
            <button onClick={this.makeNewProduct}>SUBMIT</button>
          </div>
        </div>
      );
    }
    //sorting center checkover
    else if (this.props.step == 5) {
      return (
        <div className="itemContainerSC">
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <img className="item2" src={this.state.src} />
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC"> {this.props.item.store.substring(0, 12)} </p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC"> {this.props.item.code}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC">{this.props.item.name}</p>
            <p className="itemOld">{this.state.messageOldName}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC">{this.props.item.variantid}</p>
            <p className="itemOld">{this.state.messageOldVID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <p className="itemSC">{this.props.item.productid}</p>
            <p className="itemOld">{this.state.messageOldPID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <select
              value={this.state.status}
              onChange={this.handleStatusChange}
            >
              <option value="accepted">Accepted - Resell</option>
              <option value="returning">Accepted - No Resell</option>
              <option value="rejected">Rejected</option>
              <option value="special">Special Circumstances</option>
            </select>
            <p className="item errorMessage">{this.state.blacklistMessage}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="container2SC" className={this.props.item.valueColor}>
            <hr className="horiz" />
            <br />
            <br />
            <button onClick={this.quantityDown}>-</button>
            <button onClick={this.quantityUp}>+</button>
          </div>
        </div>
      );
    }
    //make return shipment including quantity select
    else if (this.props.step == 6) {
      return (
        <div className="itemContainerSC">
          <div className="containerReturn">
            <hr className="horiz" />
            <img className="item2" src={this.state.src} />
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item"> {this.props.item.name} </p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item">{this.props.item.productID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item">{this.props.item.variantid}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <p className="item">Current: {this.props.item.quantity}</p>
            <br />
            <p className="item">
              To Return:
              <input
                className="numInput"
                value={this.props.item.value}
                onChange={this.handleQuantityChangeReturn}
              ></input>
            </p>
          </div>
        </div>
      );
    }
    //make return shipment checkover page
    else if (this.props.step == 7) {
      return (
        <div className="itemContainerSC">
          <div className="containerReturn">
            <hr className="horiz" />
            <img className="item2" src={this.state.src} />
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item"> {this.props.item.name} </p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item">{this.props.item.productID}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item">{this.props.item.variantid}</p>
          </div>
          <div className="vert">
            <hr className="vert" />
          </div>
          <div className="containerReturn">
            <hr className="horiz" />
            <br />
            <br />
            <p className="item">{this.props.item.value}</p>
          </div>
        </div>
      );
    } else if (this.props.step == 8) {
      return (
        <div className="itemContainerSC">
          <div className={this.props.item.backgroundColor}>
            <hr className="horiz" />
            <p className="item">{this.props.item.name}</p>
          </div>
          <div className="vert">
            <hr className="vertRI" />
          </div>
          <div className={this.props.item.backgroundColor}>
            <hr className="horiz" />
            <p className="item">{this.props.item.variantid}</p>
          </div>
          <div className="vert">
            <hr className="vertRI" />
          </div>
          <div className={this.props.item.backgroundColor}>
            <hr className="horiz" />
            <p className="item">{this.props.item.productid}</p>
          </div>
          <div className="vert">
            <hr className="vertRI" />
          </div>
          <div className={this.props.item.backgroundColor}>
            <hr className="horiz" />
            <button onClick={this.failItem}>N</button>
            <button onClick={this.packageItem}>Y</button>
          </div>
        </div>
      );
    }
  }
}
export default Item;
