import React, { Component } from "react";
import "./universal.css";
import "./adminApp.css";

//Progress bar used for onboarding process
function SetupNavbar(props) {
  let stepActiveArray = ["", "", ""];
  for (let i = 0; i < stepActiveArray.length; i++) {
    if (i < props.step) {
      stepActiveArray[i] = "active";
    }
  }
  return (
    <div className="containerPB">
      <ul className="progressbarOnboard">
        <li className={stepActiveArray[0]}>
          <span>Setup</span>
        </li>
        <li className={stepActiveArray[1]}>
          <span>Theme</span>
        </li>
        <li className={stepActiveArray[2]}>
          <span>Approval</span>
        </li>
        <li className={stepActiveArray[3]}>
          <span>Publish</span>
        </li>
      </ul>
    </div>
  );
}

export default SetupNavbar;
