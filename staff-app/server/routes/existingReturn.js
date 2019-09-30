"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const itemList = require("../util/mainHelper");
const expiredHelper = require("../util/expiredHelper");
const router = Router({
  prefix: "/return"
});

//change item status
router.put("/requested/itemStatus", async ctx => {
  const code = ctx.query.code;
  const rawItems = ctx.query.items;
  const db = ctx.db;
  let itemsJSON = await JSON.parse(rawItems);
  let myRef = db.collection("requestedReturns").doc(code);
  let updateFields = myRef.update({ items: itemsJSON });
  ctx.body = { success: true };
});

//write when items are received from DROPOFF
router.put("/requested/receive", async ctx => {
  const db = ctx.db;
  const code = ctx.query.code;
  const worker = ctx.query.workerID;
  const time = await getTime();
  let myRef = db.collection("requestedReturns").doc(code);
  let updateFields = myRef.update({
    order_status: "received",
    received_by: worker,
    itemsDropped: time
  });
  ctx.body = true;
});

//get all codes received by drop off worker
router.get("/dropoffSummary", async ctx => {
  const db = ctx.db;
  const id = ctx.query.id;
  let myRef = db.collection("pendingReturns");
  let query = await myRef.where("received_by", "==", id).get();
  let codes = [];
  await query.forEach(async doc => {
    codes.push(doc._fieldsProto.code.stringValue);
  });
  myRef = db.collection("requestedReturns");
  query = await myRef.where("received_by", "==", id).get();
  await query.forEach(async doc => {
    codes.push(doc._fieldsProto.code.stringValue);
  });
  ctx.body = { codes: codes };
});

//get items associated with order
router.get("/requested/items", async ctx => {
  const code = ctx.query.code;
  const db = ctx.db;
  let myRef = db.collection("requestedReturns");
  let query = await myRef.where("code", "==", code).get();
  if (query.empty) {
    ctx.body = { valid: false };
  } else {
    await query.forEach(doc => {
      ctx.body = { res: doc._fieldsProto, valid: true };
    });
  }
});

//get item list from pending (helper fn)
router.get("/pending/itemList", async ctx => {
  let fullList = await itemList.getItems(ctx.db);
  ctx.body = fullList;
});

//set time that processing began in sorting center
router.put("/requested/openTime", async ctx => {
  const code = ctx.query.code;
  const db = ctx.db;
  let myRef = db.collection("requestedReturns").doc(code);
  let currTime = await getTime();
  let updateFields = myRef.update({ processBegin: currTime });
  ctx.body = true;
});

//set time that processing ended in sorting center
router.put("/requested/closeTime", async ctx => {
  const code = ctx.query.code;
  const db = ctx.db;
  let myRef = db.collection("requestedReturns").doc(code);
  let currTime = await getTime();
  let updateFields = myRef.update({ processEnd: currTime });
  ctx.body = true;
});

//update item status in pending
router.put("/pending/items", async ctx => {
  const code = ctx.query.code;
  const items = await JSON.parse(ctx.query.items);
  const db = ctx.db;
  let myRef = db.collection("pendingReturns");
  let query = await myRef.where("code", "==", code).get();
  let dRef = "";
  await query.forEach(doc => {
    dRef = doc.ref;
  });
  let updateItems = dRef.update({ items: items });
  ctx.body = true;
});

//get current time mm/dd/yyyy-hh/mm/ss
function getTime() {
  let now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let year = now.getFullYear();
  let hour = now.getHours();
  let minute = now.getMinutes().toString();
  if (minute.length != 2) {
    minute = "0" + minute;
  }
  let second = now.getSeconds().toString();
  if (second.length != 2) {
    second = "0" + second;
  }
  let currTime =
    month + "/" + day + "/" + year + "-" + hour + ":" + minute + ":" + second;
  return currTime;
}

//make new entry in pending, delete from requested
router.post("/pending/new", async ctx => {
  const db = ctx.db;
  const codeIn = ctx.query.code;
  let myRef = db.collection("requestedReturns").doc(codeIn);
  let oldDoc = await myRef.get();
  let newDate = await expiredHelper.getCurrentDate();
  let data = {
    code: oldDoc._fieldsProto.code.stringValue,
    createdDate: oldDoc._fieldsProto.createdDate.stringValue,
    email: oldDoc._fieldsProto.email.stringValue,
    emailOriginal: oldDoc._fieldsProto.emailOriginal.stringValue,
    items: [],
    itemsDropped: oldDoc._fieldsProto.itemsDropped.stringValue,
    order: oldDoc._fieldsProto.order.stringValue,
    order_status: oldDoc._fieldsProto.order_status.stringValue,
    processBegin: oldDoc._fieldsProto.processBegin.stringValue,
    processEnd: oldDoc._fieldsProto.processEnd.stringValue,
    receivedDate: newDate,
    received_by: oldDoc._fieldsProto.received_by.stringValue,
    shop: oldDoc._fieldsProto.shop.stringValue
  };
  for (var i = 0; i < oldDoc._fieldsProto.items.arrayValue.values.length; i++) {
    let tempItem = {
      value: 0,
      flag:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.flag
          .stringValue,
      name:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name
          .stringValue,
      productid:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.productid
          .stringValue,
      productidGIT:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields
          .productidGIT.stringValue,
      reason:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.reason
          .stringValue,
      status:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.status
          .stringValue,
      store:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.store
          .stringValue,
      variantid:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.variantid
          .stringValue,
      variantidGIT:
        oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields
          .variantidGIT.stringValue,
      oldItem: {
        OLDname:
          oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
            .mapValue.fields.OLDname.stringValue,
        OLDvariantid:
          oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
            .mapValue.fields.OLDvariantid.stringValue,
        OLDproductid:
          oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
            .mapValue.fields.OLDproductid.stringValue,
        OLDvariantidGIT:
          oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
            .mapValue.fields.OLDvariantidGIT.stringValue,
        OLDproductidGIT:
          oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
            .mapValue.fields.OLDproductidGIT.stringValue
      }
    };
    data.items.push(tempItem);
  }
  let writeDoc = await db
    .collection("pendingReturns")
    .doc(codeIn)
    .set(data);
  let deleteDoc = db
    .collection("requestedReturns")
    .doc(codeIn)
    .delete();
  ctx.body = true;
});

module.exports = router;
