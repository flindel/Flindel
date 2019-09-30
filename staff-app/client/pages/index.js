"use strict";
import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import FlindelWorker from "./worker/flindelWorker";

class Index extends React.Component {
  render() {
    return (
      <div>
        <FlindelWorker />
      </div>
    );
  }
}

export default Index;
