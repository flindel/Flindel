"use strict";
import React, { Component } from "react";
import "./universal.css";
import "./flindelInterface.css";
import SortingCentre from "./sortingCentre";
import Blacklist from "./blacklistUniversal";
import ReturnShipment from "./returnShipment";
import AssembleOrders from "./assembleOrders";
import DropOff from "./dropOff";
import DeliverOrders from "./deliverOrders";
import Revert from "./revert";

//MAIN DASHBOARD FOR FLINDEL WORKER AP

class Interface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1
    };
    this.goHome = this.goHome.bind(this);
    this.goSortingCenter = this.goSortingCenter.bind(this);
    this.goDelivery = this.goDelivery.bind(this);
    this.goBlacklist = this.goBlacklist.bind(this);
    this.goReturnShipment = this.goReturnShipment.bind(this);
    this.goDropOff = this.goDropOff.bind(this);
    this.goAssemble = this.goAssemble.bind(this);
    this.goRevert = this.goRevert.bind(this);
    //this.doesProductExist = this.doesProductExist.bind(this)
  }

  //buttons to go to each method
  goHome() {
    this.setState({ step: 1 });
  }

  goSortingCenter() {
    this.setState({ step: 2 });
  }

  goReturnShipment() {
    this.setState({ step: 3 });
  }

  goAssemble() {
    this.setState({ step: 4 });
  }

  goBlacklist() {
    this.setState({ step: 5 });
  }

  goDropOff() {
    this.setState({ step: 6 });
  }

  goDelivery() {
    this.setState({ step: 7 });
  }

  goRevert() {
    this.setState({ step: 8 });
  }

  //conditional render - step1 for enter store, step2 for doing stuff
  render() {
    if (this.state.step == 1) {
      return (
        <div>
          <h1 className="main">Flindel Worker Interface</h1>
          <br />
          <br />
          <h3 className="main">
            {" "}
            Please select one of the buttons below to continue.
          </h3>
          <br />
          <button className="main" onClick={this.goSortingCenter}>
            SORTING CENTER
          </button>
          <button className="main" onClick={this.goDropOff}>
            DROP OFF
          </button>
          <button className="main" onClick={this.goAssemble}>
            ASSEMBLE ORDERS
          </button>
          <button className="main" onClick={this.goDelivery}>
            DELIVER ORDERS
          </button>
          <button className="main" onClick={this.goReturnShipment}>
            CREATE RETURN SHIPMENT
          </button>
          <button className="main" onClick={this.goBlacklist}>
            VIEW/EDIT BLACKLIST
          </button>
          <button className="main" onClick={this.goRevert}>
            REVERT
          </button>
        </div>
      );
    } else if (this.state.step == 2) {
      return (
        <div>
          <SortingCentre back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 3) {
      return (
        <div>
          <ReturnShipment back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 4) {
      return (
        <div>
          <AssembleOrders back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 5) {
      return (
        <div>
          <Blacklist back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 6) {
      return (
        <div>
          <DropOff back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 7) {
      return (
        <div>
          <DeliverOrders back={this.goHome.bind(this)} />
        </div>
      );
    } else if (this.state.step == 8) {
      return (
        <div>
          <Revert back={this.goHome.bind(this)} />
        </div>
      );
    }
  }
}

export default Interface;
