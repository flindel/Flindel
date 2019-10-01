"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const fulfillHelper = require("../util/webhookHelper");
const expiredHelper = require("../util/expiredHelper");

const router = Router({
  prefix: "/fulfillment"
});

//get all orders for assembly step
router.get("/assemble", async ctx => {
  let date = expiredHelper.getCurrentDate();
  const db = ctx.db;
  const code = ctx.query.workerID;
  let orders = [];
  let myRef = db.collection("fulfillments");
  if (code == "1") {
    let query = await myRef.get();
    await query.forEach(async doc => {
      orders.push(doc._fieldsProto);
    });
  } else {
    let query = await myRef.where("workerid", "==", code).get();
    await query.forEach(async doc => {
      orders.push(doc._fieldsProto);
    });
  }
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].dateCreated.stringValue.substring(0, 9) == date) {
      if (parseInt(orders[i].dateCreated.stringValue.substring(10, 12)) < 9) {
        orders.splice(i, 1);
        i--;
      }
    }
  }
  ctx.body = orders;
});

//get all orders matching id for delivery step
router.get("/deliver", async ctx => {
  let date = expiredHelper.getCurrentDate();
  const db = ctx.db;
  const code = ctx.query.workerID;
  let orders = [];
  let myRef = db.collection("fulfillments");
  if (code == "1") {
    let query = await myRef.get();
    await query.forEach(async doc => {
      orders.push(doc._fieldsProto);
    });
  } else {
    let query = await myRef.where("workerid", "==", code).get();
    await query.forEach(async doc => {
      orders.push(doc._fieldsProto);
    });
  }
  for (var i = 0; i < orders.length; i++) {
    if (
      orders[i].status.stringValue == "incomplete" ||
      orders[i].status.stringValue == "" ||
      orders[i].status.stringValue == "failed" ||
      orders[i].status.stringValue == "complete"
    ) {
      orders.splice(i, 1);
      i--;
    }
  }
  ctx.body = orders;
});

//update fulfillments table
router.put("/update", async ctx => {
  const db = ctx.db;
  let batch = db.batch();
  let myRef = db.collection("fulfillments");
  let orders = ctx.request.body;
  for (var i = 0; i < orders.length; i++) {
    let query = await myRef.where("orderid", "==", orders[i].orderid).get();
    await query.forEach(async doc => {
      batch.set(doc.ref, orders[i]);
    });
  }
  await batch.commit();
  ctx.body = true;
});
//get time helper function
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

//complete items
router.post("/complete", async ctx => {
  //delete from curr + add to fulfillmentHistory in batch
  //for each item, add to whatever
  const db = ctx.db;
  let batch = db.batch();
  let myRef = db.collection("fulfillments");
  let newRef = db.collection("fulfillmentHistory");
  let currTime = await getTime();
  let orders = ctx.request.body;
  //console.log(orders);
  for (var i = 0; i < orders.length; i++) {
    //set time
    orders[i].dateCompleted = currTime;
    let query = await myRef.where("orderid", "==", orders[i].orderid).get();
    await query.forEach(async doc => {
      //delete old
      console.log("delete");
      //console.log(doc);
      batch.delete(doc.ref);
    });
    let newDoc = newRef.doc();
    //write new
    batch.set(newDoc, orders[i]);
    for (var j = 0; j < orders[i].items.length; j++) {
      console.log("update items to fulfill status");
      if (orders[i].items[j].fulfilled == 1) {
        //update items
        console.log(orders[i].items[j]);
        fulfillHelper.completeReturnItem(
          ctx.db,
          orders[i].orderid,
          orders[i].items[j].variantid,
          orders[i].items[j].itemid,
          orders[i].items[j].quantity,
          orders[i].store,
          orders[i].code
        );
      }
    }
  }
  //commit all
  await batch.commit();
  ctx.body = true;
});

module.exports = router;
