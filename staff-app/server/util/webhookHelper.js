"use strict";
const rp = require("request-promise");
const { api_link } = require("../default-shopify-api.json");
const expired = require("./expiredHelper");
const inv = require("./editInventory");

//mark item as sold (webhook)
async function sellReturnItem(db, varId, store, orderNum) {
  let myRef = db.collection("items");
  let found = false;
  let tempDate = "1/1/2100";
  let tempRef = "";
  let query = await myRef
    .where("status", "==", "reselling")
    .where("store", "==", store)
    .where("variantidGIT", "==", varId.toString())
    .get();
  await query.forEach(async doc => {
    let itemDate = doc._fieldsProto.dateProcessed.stringValue;
    let difference = expired.getDateDifference(tempDate, itemDate);
    if (difference < 0) {
      found = true;
      tempDate = itemDate;
      tempRef = doc.id;
    }
  });
  if (found) {
    let docToUpdate = myRef.doc(tempRef);
    let updateFields = docToUpdate.update({
      status: "sold",
      dateSold: expired.getCurrentDate(),
      orderNum: orderNum
    });
  }
}

//mark item as delivered
async function completeReturnItem(
  db,
  orderId,
  varId,
  itemId,
  quantity,
  store,
  code
) {
  //UPDATE FLINDEL STATUS
  let myRef = db.collection("items");
  let count = 0;
  let query = await myRef
    .where("status", "==", "sold")
    .where("store", "==", store)
    .where("variantidGIT", "==", varId.toString())
    .get();
  await query.forEach(async doc => {
    if (count < quantity) {
      let docToUpdate = myRef.doc(doc.id);
      let updateFields = docToUpdate.update({
        status: "fulfilled",
        order: code
      });
      count++;
    }
  });
  //actually update the shopify fulfillment ///////////////////////////////////////////////////////////////////////
  updateFulfillment(db, store, orderId, itemId, quantity)
}

async function updateFulfillment(db, store, orderId, itemId, quantity) {
  //get access token to update fulfillment
  let { accessToken, torontoLocation } = await inv.getAccessToken(db, store);
  const option = {
    method: "post",
    url: `https://${store}/${api_link}/orders/${orderId}/fulfillments.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true,
    body: {
      fulfillment: {
        location_id: torontoLocation,
        tracking_number: null,
        line_items: [
          {
            id: itemId,
            quantity: quantity
          }
        ]
      }
    }
  };
  let temp = await rp(option);
}

module.exports = { sellReturnItem, completeReturnItem };
