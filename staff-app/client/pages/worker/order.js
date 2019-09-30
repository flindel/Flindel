"use strict";
import React, { Component } from "react";
import "./universal.css";
import Item from "./itemSC";
import Select from "react-select";

class Order extends Component {
  //constructor/binding methods
  constructor(props) {
    super(props);
    this.state = {
      style: {
        height: ""
      },
      boxStyle: {
        height: "",
        backgroundColor: this.props.order.backgroundColor
      },
      color: ""
    };
    this.setState = this.setState.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.completeOrder = this.completeOrder.bind(this);
    this.failOrder = this.failOrder.bind(this);
    this.incompleteOrder = this.incompleteOrder.bind(this);
    this.changeItemStatus = this.changeItemStatus.bind(this);
    this.deliveryFail = this.deliveryFail.bind(this);
    this.deliverySuccess = this.deliverySuccess.bind(this);
    this.changeDriverID = this.changeDriverID.bind(this);
  }

  componentWillMount() {
    //change sizing for orders, as it's affected by number of items
    if (this.props.step == 1) {
      let size = 80 + 60 * this.props.order.items.length;
      let tempSize = size.toString() + "px";
      let tempStyle = {
        height: tempSize
      };
      let tempStyleBox = {
        height: tempSize,
        backgroundColor: this.state.boxStyle.backgroundColor
      };
      this.setState({ style: tempStyle, boxStyle: tempStyleBox });
    }
  }

  //change driver id through props
  changeDriverID(e) {
    this.props.changeDriverID(this.props.order.index, e.target.value);
  }

  //change item status, this is intermediate function, has identical child and parent
  changeItemStatus(itemIndex, value) {
    this.props.changeItemStatus(itemIndex, this.props.order.index, value);
  }

  //incomplete entire order
  incompleteOrder() {
    this.props.changeOrderStatus(this.props.order.index, 0);
  }

  //change message in props (assemble)
  handleMessage(e) {
    this.props.changeMessage(e.target.value, this.props.order.index);
  }

  //complete entire order (assemble)
  completeOrder() {
    this.props.changeOrderStatus(this.props.order.index, 1);
  }

  //fail entire order (assemble)
  failOrder() {
    this.props.changeOrderStatus(this.props.order.index, -1);
  }

  //fail to deliver order
  deliveryFail() {
    this.setState({ color: "redBackground" });
    this.props.changeOrderStatus(this.props.order.index, -1);
  }

  //succesfully deliver order
  deliverySuccess() {
    this.setState({ color: "greenBackground" });
    this.props.changeOrderStatus(this.props.order.index, 1);
  }

  render() {
    if (this.props.step == 1) {
      return (
        <div className="itemContainerSC">
          <div className="deliveryS" style={this.state.boxStyle}>
            <hr className="horizStrong" />
            <br />
            <br />
            <p>{this.props.order.code}</p>
          </div>
          <div className="vert">
            <hr className="vertR" style={this.state.style} />
          </div>
          <div className="deliveryS" style={this.state.boxStyle}>
            <hr className="horizStrong" />
            <br />
            <p> {this.props.order.name} </p>
            <br />
            <p> {this.props.order.shippingAddress}</p>
          </div>
          <div className="vert">
            <hr className="vertR" style={this.state.style} />
          </div>
          <div className="deliveryS" style={this.state.boxStyle}>
            <hr className="horizStrong" />
            <br />
            <br />
            <p>{this.props.order.store.substring(0, 12)}</p>
            <br />
          </div>
          <div className="vert">
            <hr className="vertR" style={this.state.style} />
          </div>
          <div className="deliveryL" style={this.state.style}>
            <hr className="horizStrong" />
            <div className="itemContainerSC">
              <div className="itemOrderHeader">
                <p>NAME</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="itemOrderHeader">
                <p>VARIANT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="itemOrderHeader">
                <p>PRODUCT ID</p>
              </div>
              <div className="vert">
                <hr className="vertHeader" />
              </div>
              <div className="itemOrderHeader">
                <p>STATUS</p>
              </div>
            </div>
            {this.props.order.items.map((item, index) => {
              return (
                <Item
                  item={item}
                  changeItemStatus={this.changeItemStatus.bind(this)}
                  step={8}
                  key={item.variantid + index}
                />
              );
            })}
          </div>
          <div className="vert">
            <hr className="vertR" style={this.state.style} />
          </div>
          <div className="deliveryM" style={this.state.boxStyle}>
            <hr className="horizStrong" />
            <textarea
              value={this.props.order.comment}
              onChange={this.handleMessage}
            />
            <br />
            <p>
              {" "}
              DRIVER:
              <input
                type="text"
                value={this.props.order.workerid}
                onChange={this.changeDriverID}
              />
            </p>
          </div>
        </div>
      );
    } else if (this.props.step == 2) {
      return (
        <div>
          <div className="itemContainerSC">
            <div className={["delivery2S", this.state.color].join(" ")}>
              <hr className="horiz" />
              <br />
              <p>{this.props.order.code}</p>
            </div>
            <div className="vert">
              <hr className="vert" />
            </div>
            <div className={["delivery2L", this.state.color].join(" ")}>
              <hr className="horiz" />
              <p>
                {this.props.order.name}, {this.props.order.shippingAddress}
              </p>
            </div>
            <div className="vert">
              <hr className="vert" />
            </div>
            <div className={["delivery2S", this.state.color].join(" ")}>
              <hr className="horiz" />
              <button onClick={this.deliveryFail}>-</button>
              <button onClick={this.deliverySuccess}>+</button>
            </div>
            <div className="vert">
              <hr className="vert" />
            </div>
            <div className={["delivery2L", this.state.color].join(" ")}>
              <hr className="horiz" />
              <textarea
                value={this.props.order.comment}
                onChange={this.handleMessage}
              />
            </div>
          </div>
        </div>
      );
    }
  }
}
export default Order;
