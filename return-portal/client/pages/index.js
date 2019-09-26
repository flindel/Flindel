"use strict";
import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import IdentifyApp from "./Confirmation/IdentifyApp2";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;

class Index extends React.Component {
  render() {
    return (
      <div>
        <IdentifyApp serveoname={API_URL} />
      </div>
    );
  }
}

export default Index;
