"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const itemList = require("../util/mainHelper");
const router = Router({
  prefix: "/return"
});

//make sure ID is unique, return yes/no
router.get("/requested/uuid", async ctx => {
  const db = ctx.db;
  const code = ctx.query.code;
  //check requested returns
  let myRef = db.collection("requestedReturns");
  let query = await myRef.where("code", "==", code).get();
  if (query.empty) {
    //check pending
    let myRef2 = db.collection("pendingReturns");
    let query2 = await myRef2.where("code", "==", code).get();
    if (query2.empty) {
      ctx.body = { unique: true };
    } else {
      ctx.body = { unique: false };
    }
  } else {
    ctx.body = { unique: false };
  }
});

//see if order exists for review/restart
router.get("/requested/exists", async ctx => {
  const order = ctx.query.orderNum;
  const shopDomain = ctx.query.shopDomain;
  console.log("DB+++" + shopDomain);
  const db = ctx.db;
  let myRef = db.collection("requestedReturns");
  ctx.body = {
    code: "none",
    exist: false
  };
  let querySnapshot = await myRef
    .where("order", "==", order)
    .where("shop", "==", shopDomain)
    .get();
  if (!querySnapshot.empty) {
    //data.items is the origianl items Array in db, which may contain repeat items
    const data = querySnapshot.docs[0].data();
    const email = data.email;
    //returnItems is the return array without repeated item
    let returnItems = [data.items[0]];
    returnItems[0].quantity = 1;
    for (let i = 1; i < data.items.length; i++) {
      if (
        data.items[i].variantid != returnItems[returnItems.length - 1].variantid
      ) {
        returnItems.push(data.items[i]);
        returnItems[returnItems.length - 1].quantity = 1;
      } else {
        returnItems[returnItems.length - 1].quantity++;
      }
    }
    returnItems.forEach(e => {
      e.productID = e.productid;
    });
    ctx.body = {
      exist: true,
      code: data.code,
      items: returnItems,
      email: email,
      emailOriginal: data.emailOriginal
    };
  }
});

//delete from requested return and write to history when order is cancelled
router.put("/requested/orderStatus", async ctx => {
  const db = ctx.db;
  const code = ctx.query.code;
  let myRef = db.collection("requestedReturns").doc(code);
  let query = await myRef.update({
    order_status: "cancelled"
  });
  let getDoc = await db
    .collection("requestedReturns")
    .doc(code)
    .get();
  let data = getDoc.data();
  let setDoc = db
    .collection("historyReturns")
    .doc()
    .set(data);
  let deleteDoc = db
    .collection("requestedReturns")
    .doc(code)
    .delete();

  ctx.body = { success: true };
});

//make new entry in requested returns
router.post("/requested/new", async ctx => {
  const db = ctx.db;
  const shop = ctx.request.body.shop;
  //.substring(8,100)
  console.log("THE SHOP IS " + shop);
  const rawItems = ctx.request.body.items;
  const orderNum = ctx.request.body.orderNum;
  const date = ctx.request.body.date;
  const code = ctx.request.body.code;
  const email = ctx.request.body.email;
  const emailOriginal = ctx.request.body.emailOriginal;
  let itemsJSON = await JSON.parse(rawItems);
  let data = {
    //base information
    code: code,
    email: email,
    emailOriginal: emailOriginal,
    shop: shop,
    order: orderNum,
    order_status: "submitted",
    items: [],
    createdDate: date,
    received_by: "",
    processEnd: "",
    processBegin: "",
    itemsDropped: ""
  };
  //all items start submitted
  const myStatus = "submitted";
  for (var i = 0; i < itemsJSON.length; i++) {
    let [
      originalID,
      gitID,
      originalVarID,
      gitVarID
    ] = await itemList.getGITInformation(
      ctx.db,
      itemsJSON[i].variantid.toString(),
      itemsJSON[i].productID.toString()
    );
    data.items.push({
      name: itemsJSON[i].name,
      flag: "0",
      title: itemsJSON[i].title,
      variantTitle: itemsJSON[i].variantTitle,
      productid: originalID,
      productidGIT: gitID,
      reason: itemsJSON[i].reason,
      variantid: originalVarID,
      variantidGIT: gitVarID,
      status: myStatus
    });
  }
  //write to requested returns
  let setDoc = db
    .collection("requestedReturns")
    .doc(code)
    .set(data);
  ctx.body = "success";
});

module.exports = router;
