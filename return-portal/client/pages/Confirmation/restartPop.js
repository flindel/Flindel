"use strict";
import React, { Component } from "react";
import "./universal.css";

class restartPop extends Component {
  constructor(props) {
    super(props);
    //could be used later, not necessary now
    this.state = {};
  }

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="popup_content">
            <h2 className="r2 popup_title">Confirmation</h2>
            <br />
            <p>
              If you proceed, your current return form will be deleted, and you
              will be able to submit a new return form. Are you sure you wish to
              proceed?
            </p>
            <br />
            <button className="Submit2 Small" onClick={this.props.closePopup}>
              No, keep my old return.
            </button>
            <br />
            <button className="Submit2 Small" onClick={this.props.handleDelete}>
              {" "}
              Yes, begin my new return.
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default restartPop;
