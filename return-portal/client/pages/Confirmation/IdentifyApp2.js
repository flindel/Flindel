"use strict";
import React, { Component } from "react";
import Search from "./findOrder";
import ItemList from "./itemSelect";
import ConfirmationPage from "./showConfirmation";
import CheckPage from "./reasonSelect";
import NB from "./navbar.js";
import PriceDisplay from "./finalConfirmation.js";
import Review from "./reviewRestart";
import "@shopify/polaris/styles.css";
let serveoname = "";
let shop = "";

class IdentifyApp extends Component {
  //constructor and binding methods
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      step: 0,
      code: "",
      email: "",
      newEmail: "",
      returnlist: [],
      shopName: "",
      orderNum: "",
      errorMessage: "",
      returnPolicy: [],
      defaultReturn: "",
      shopDomain: "",
      emailOriginal: "",
      restartEmail: ""
    };
    this.returnItemList = [];
    this.identifyItems = this.identifyItems.bind(this);
    this.forward = this.forward.bind(this);
    this.setState = this.setState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkOver = this.checkOver.bind(this);
    this.setReturnList = this.setReturnList.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.sendToDB = this.sendToDB.bind(this);
    this.finishOrder = this.finishOrder.bind(this);
    this.setReason = this.setReason.bind(this);
    this.restart = this.restart.bind(this);
    this.viewPage2 = this.viewPage2.bind(this);
    this.viewPage3 = this.viewPage3.bind(this);
    this.viewPage4 = this.viewPage4.bind(this);
    this.checkReturnsFromDB = this.checkReturnsFromDB.bind(this);
    this.restartReturn = this.restartReturn.bind(this);
    this.checkValid = this.checkValid.bind(this);
  }

  //check to see if return item is valid
  checkValid(varID) {
    //check database table from didMount
    if (this.state.returnPolicy[varID] == null) {
      return parseInt(this.state.defaultReturn);
    } else {
      return this.state.returnPolicy[varID].stringValue;
    }
  }

  //load return policy - have to expand this to multiple stores once we load
  async componentDidMount() {
    serveoname = this.props.serveoname.substring(8);
    console.log("serveoname++++++" + serveoname);
    shop = window.location.hostname;
    console.log("shop-----" + shop);
    this.setState({
      shopDomain: shop
    });
    if (shop.indexOf("myshopify") == -1) {
      console.log("shop=====" + shop);
      //if the hostname is not a .myshopify domain, get myshopifyDomain from DB
      let domain = await fetch(
        `https://${serveoname}/shop/myshopifydomain?shop=${encodeURIComponent(
          shop
        )}`,
        {
          method: "get"
        }
      );
      let domainJson = await domain.json();
      shop = domainJson.myshopifyDomain;
      console.log("shop++++" + shop);
    }
    console.log(shop);
    //get return policy from db
    let temp = await fetch(
      `https://${serveoname}/shop/returnPolicy?shop=${encodeURIComponent(
        shop
      )}`,
      {
        method: "get"
      }
    );
    let json = await temp.json();
    this.setState({
      step: 1,
      returnPolicy: json.res.mapValue.fields,
      defaultReturn: json.default.stringValue
    });
  }

  //generate usable unique codes
  async generateID() {
    //alphabet, vowels removed for censoring
    const alphabet = "BCDFGHJKLMNPQRSTVWXZ123456789";
    const codeLength = 6;
    let code = "";
    for (var i = 0; i < codeLength; i++) {
      let index = Math.floor(Math.random() * alphabet.length);
      code += alphabet[index];
      //search here instead of manually setting
    }
    //set state to the new code
    let unique = await this.checkUnique(code);
    if (unique == false) {
      this.generateID();
    } else {
      await this.setState({ step: 5, code: code });
      this.sendToDB();
      this.sendEmail();
    }
  }

  //view second page (item select)
  viewPage2() {
    this.setState({ step: 2 });
  }

  //view third page (reason select)
  viewPage3() {
    for (var i = 0; i < this.returnItemList.length; i++) {
      this.returnItemList[i].reason = "---";
    }
    this.setState({ step: 3 });
  }

  //view fourth page (check over)
  viewPage4() {
    this.setState({ step: 4 });
  }

  /* This sets the reason for items return. the data only passes correctly if both lists are used */
  async setReason(varID, reason, oldreason) {
    let count = 0;
    let found = false;
    //change reason (copy over to master)
    while (count < this.returnItemList.length && found == false) {
      let temp = this.returnItemList[count];
      if (
        varID == temp.variantid &&
        temp.reason == oldreason &&
        found == false
      ) {
        this.returnItemList[count].reason = reason;
        found = true;
      } else {
        count += 1;
      }
    }
    //copy over to return list
    await this.setState({ returnlist: [] });
    for (var i = 0; i < this.returnItemList.length; i++) {
      let temp = this.returnItemList[i];
      let tjs = JSON.stringify(temp);
      let newobj = JSON.parse(tjs);
      let tempArray = this.state.returnlist;
      tempArray.push(newobj);
      this.setState({ returnlist: tempArray });
    }
  }

  //proceed to checkover page from select page if item is selected
  checkOver() {
    if (this.returnItemList.length > 0) {
      this.setState({ step: 3 });
    }
  }

  //move forward from checkover page to confirmation page
  forward() {
    for (var i = 0; i < this.returnItemList.length; i++) {
      this.returnItemList[i].reason = "";
    }
    this.setState({ step: 4 });
  }

  //move forward from confirmation page to final page
  async finishOrder() {
    let tempList = this.state.returnlist;
    //duplicate items for database entry
    for (var i = 0; i < tempList.length; i++) {
      let curr = tempList[i];
      if (curr.value > 1) {
        let temp = curr.value;
        tempList[i].value = 1;
        for (var j = 0; j < temp - 1; j++) {
          tempList.push(tempList[i]);
        }
      }
    }
    await this.setState({ returnlist: tempList });
    await this.generateID();
  }

  //begin return portal from very start
  restart() {
    this.setState({
      items: [],
      step: 1,
      code: "",
      email: "",
      newEmail: "",
      returnlist: [],
      shopName: "",
      orderNum: "",
      existReturn: false,
      errorMessage: "",
      shopDomain: ""
    });
    this.returnItemList = [];
  }

  //send email to customer to confirm their return, calls backend function
  sendEmail() {
    fetch(
      `https://${serveoname}/send/confirmation?email=${encodeURIComponent(
        this.state.email
      )}&code=${encodeURIComponent(this.state.code)}`,
      {
        method: "post"
      }
    );
  }

  //check if code is unique (call to db)
  async checkUnique(code) {
    let temp = await fetch(
      `https://${serveoname}/return/requested/uuid?code=${encodeURIComponent(
        code
      )}`,
      {
        method: "get"
      }
    );
    let json = await temp.json();
    return json.unique;
  }

  //send information to firestore db
  sendToDB() {
    let currentDate = "";
    currentDate +=
      new Date().getMonth() +
      1 +
      "/" +
      new Date().getDate() +
      "/" +
      new Date().getFullYear();
    let items = JSON.stringify(this.state.returnlist);
    const body = {
      shop: this.state.shopDomain,
      date:currentDate,
      code: this.state.code,
      orderNum: this.state.orderNum,
      emailOriginal:this.state.emailOriginal,
      email:this.state.email,
      items:items
    }
    const options = {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };
    fetch(
      `https://${serveoname}/return/requested/new`,options)
    
  }

  //set email from a manual entry from the checkover page
  setEmail() {
    let temp = this.state.newEmail.toLowerCase();
    this.state.email = temp;
  }

  //handle change to state variable
  handleChange(inp) {
    return function(e) {
      var state = {};
      state[inp] = e.target.value;
      this.setState(state);
      this.setState({});
    }.bind(this);
  }

  //set return list (have to recreate items as form of deep copy)
  setReturnList(listIn) {
    this.returnItemList = [];
    for (var i = 0; i < listIn.length; i++) {
      let tempItem = {
        productID: listIn[i].productID,
        variantid: listIn[i].variantid,
        name: listIn[i].name,
        title: listIn[i].title,
        variantTitle: listIn[i].variantTitle,
        value: listIn[i].value,
        quantity: listIn[i].quantity,
        reason: listIn[i].reason,
        src: listIn[i].src,
        price: listIn[i].price
      };
      this.returnItemList.push(tempItem);
    }
  }

  //check returns database to see if return already exists
  async checkReturnsFromDB(orderNum, shopDomain) {
    let temp = await fetch(
      `https://${serveoname}/return/requested/exists?orderNum=${encodeURIComponent(
        orderNum
      )}&shopDomain=${encodeURIComponent(shopDomain)}`,
      {
        method: "get"
      }
    );
    let json = await temp.json();
    if (json.exist) {
      //set information if it already does
      const returnInfo = {
        code: json.code,
        email: json.email,
        orderNum: orderNum,
        items: json.items,
        emailOriginal: json.emailOriginal
      };
      return returnInfo;
    } else {
      return false;
    }
  }

  //if they do restart, flip status to replaced and move to history
  async restartReturn(orderNum, emailAdd, code) {
    // call database change order_status
    let temp = await fetch(
      `https://${serveoname}/return/requested/orderStatus?code=${encodeURIComponent(
        this.state.code
      )}`,
      {
        method: "PUT"
      }
    );
    let json = await temp.json();
    if (json.success) {
      //restart return process
      this.setState({
        existReturn: false
      });
      await this.identifyItems(orderNum, emailAdd, false); //false means function will not check database, but directly show itemlist
    }
  }

  //process of selecting whether order is valid
  async identifyItems(orderNum, emailAdd, checkDB) {
    //matching phone number to shopify style
    let phoneNum = "+1";
    phoneNum += emailAdd;
    for (var i = 0; i < phoneNum.length; i++) {
      //ignoring characters that people use to enter their phone number
      if (
        phoneNum[i] == " " ||
        phoneNum[i] == "-" ||
        phoneNum[i] == "(" ||
        phoneNum[i] == ")"
      ) {
        phoneNum = phoneNum.substring(0, i) + phoneNum.substring(i + 1);
      }
    }
    this.setState({
      email: emailAdd.toLowerCase(),
      emailOriginal: emailAdd.toLowerCase()
    });
    const data = { orderNumber: orderNum, emailAddress: emailAdd };
    //get order fromm shopify db
    let temp = await fetch(
      `https://${serveoname}/orders?orderNum=${encodeURIComponent(
        data.orderNumber
      )}&shop=${encodeURIComponent(shop)}`,
      {
        method: "GET"
      }
    );
    let resData = await temp.json();
    if (JSON.stringify(resData.orders) != "[]") {
      //date that order occured
      let dateString = resData.orders[0].processed_at;
      const orderDate =
        dateString.substring(5, 7) +
        "/" +
        dateString.substring(8, 10) +
        "/" +
        dateString.substring(0, 4);
      const currentDate =
        new Date().getMonth() +
        1 +
        "/" +
        new Date().getDate() +
        "/" +
        new Date().getFullYear();
      const date2 = new Date(dateString);
      const date1 = new Date(currentDate);
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      //see how long has passed - used to filter items
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (
        resData.orders[0].email.toLowerCase() == emailAdd.toLowerCase() ||
        resData.orders[0].phone == phoneNum
      ) {
        //if correct
        //if order doesn't already exist in db
        let returnInfo = false;
        if (checkDB) {
          returnInfo = await this.checkReturnsFromDB(
            data.orderNumber,
            this.state.shopDomain
          );
        }
        //redirect if item already exists
        if (returnInfo) {
          this.setState({
            code: returnInfo.code,
            email: returnInfo.email,
            orderNum: returnInfo.orderNum,
            existReturn: true,
            returnList: returnInfo.items,
            restartEmail: returnInfo.emailOriginal
          });
        } else {
          this.setState({
            //set the items var to the items in the order
            items: resData.orders[0].line_items.map(item => {
              //see if the time passed is less or greater than allowed
              let numDays = parseInt(this.checkValid(item.variant_id));
              let toAccept = numDays - diffDays;
              if (toAccept > 0) {
                return {
                  variantID: item.variant_id,
                  productID: item.product_id,
                  name: item.name,
                  title: item.title,
                  variantTitle: item.variant_title,
                  quantity: item.quantity
                };
              } else {
                return {
                  variantID: item.variant_id,
                  productID: item.product_id,
                  name: item.name,
                  title: item.title,
                  variantTitle: item.variant_title,
                  quantity: 0
                };
              }
            }),
            //set searchstatus to true to move forward
            step: 2,
            orderNum: orderNum
          });
        }
      } else {
        //show they made an incorrect attempt
        this.setState({
          errorMessage:
            "The order number, email, or phone number you entered didn't match our records."
        });
      }
    } else {
      //show they made an incorrect attempt
      this.setState({
        errorMessage:
          "The order number, email, or phone number you entered didn't match our records."
      });
    }
  }

  /*
    Conditional render/mainline
    All steps call a subpage based on the state variables on which page to show
    */
  render() {
    if (this.state.step == 0) {
      return (
        <div>
          {/* {<NB
                    shopName = {this.state.shopName}/>} */}
          <br />
          <br />
          <br />
          <div className="loading">
            <p>
              <img src="https://drive.google.com/uc?id=1sdUC8q-XdCViXV-xKYC-XakSsqFDFEEd" />
            </p>
          </div>
        </div>
      );
    } else if (this.state.step == 1) {
      if (this.state.existReturn) {
        return (
          <div>
            <NB shopName={this.state.shopName} shopDomain={shop} />
            <Review
              restart={this.restart.bind(this)}
              code={this.state.code}
              email={this.state.restartEmail}
              orderNum={this.state.orderNum}
              items={this.state.returnList}
              serveoname={serveoname}
              restartReturn={this.restartReturn}
              shop={shop}
            />
          </div>
        );
      } else {
        return (
          <div>
            <NB
              step1={"active"}
              step2={""}
              step3={""}
              show={false}
              findOrderPage={true}
              shopName={this.state.shopName}
              shopDomain={shop}
            />
            <p className="errorMessage">{this.state.errorMessage}</p>
            <Search
              identifyCustomerID={this.identifyCustomerID}
              identifyItems={this.identifyItems}
            />
          </div>
        );
      }
    } else if (!this.state.existReturn && this.state.step == 2) {
      return (
        <div>
          <NB
            step1={"live"}
            step2={""}
            step3={""}
            show={true}
            shopName={this.state.shopName}
          />
          <ItemList
            shop={shop}
            serveoname={serveoname}
            orderNum={this.state.orderNum}
            handleSubmit={this.checkOver.bind(this)}
            setReturnList={this.setReturnList.bind(this)}
            items={this.state.items}
          />
        </div>
      );
    } else if (this.state.step == 3) {
      return (
        <div>
          <NB
            step1={"active"}
            step2={"live"}
            step3={""}
            show={true}
            viewPage2={this.viewPage2.bind(this)}
            shopName={this.state.shopName}
          />
          <CheckPage
            shop={shop}
            shopName={this.state.shopName}
            serveoname={serveoname}
            setReason={this.setReason.bind(this)}
            items={this.returnItemList}
            email={this.state.email}
            selectedEmail={this.state.selectedEmail}
            newEmail={this.state.newEmail}
            orderNum={this.state.orderNum}
            updateforward={this.forward.bind(this)}
            updateEmail={this.setEmail.bind(this)}
            updatehandleChange={this.handleChange.bind(this)}
          />
        </div>
      );
    } else if (this.state.step == 4) {
      return (
        <div>
          <NB
            step1={"active"}
            step2={"active"}
            step3={"live"}
            show={true}
            viewPage2={this.viewPage2.bind(this)}
            viewPage3={this.viewPage3.bind(this)}
            shopName={this.state.shopName}
          />
          <PriceDisplay
            shop={shop}
            serveoname={serveoname}
            items={this.state.returnlist}
            orderNum={this.state.orderNum}
            finishOrder={this.finishOrder.bind(this)}
          />
        </div>
      );
    } else if (this.state.step == 5) {
      return (
        <div>
          <NB
            step1={"active"}
            step2={""}
            step3={""}
            show={false}
            shopName={this.state.shopName}
            shopDomain={shop}
          />
          <ConfirmationPage
            serveoname={serveoname}
            code={this.state.code}
            email={this.state.email}
          />
        </div>
      );
    }
  }
}

export default IdentifyApp;
