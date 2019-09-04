import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import DuplicateApp from "./DuplicateItems/DuplicateApp";

class Index extends React.Component {
  render() {
    return (
      <div>
        <DuplicateApp />
      </div>
    );
  }
}

export default Index;
