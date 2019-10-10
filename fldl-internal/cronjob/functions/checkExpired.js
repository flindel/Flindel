"use strict";
const inv = require("./editInventory");
const dateUtil = require('../util/dateUtil');


//get rid of anything that's been in orders/items for over 7 days
async function checkExpired(db) {
  console.log("checkExpried");
    //await clearExpiredItems(db);
    await clearExpiredOrders(db);
}

//clear orders from requestedReturns that have expired
async function clearExpiredOrders(db) {  //batch for efficiency
  let batch = db.batch();
  let currentDate = dateUtil.getCurrentDate();
  let myRef = db.collection("requestedReturns");
  let query = await myRef.get();
  await query.forEach(async doc => {
    let orderDate = doc._fieldsProto.createdDate.stringValue;
    //get time elapsed since return was requested
    let diffDays = dateUtil.getDateDifference(currentDate, orderDate);
    //if there's a 7 day difference, return is expired
    console.log("diff days: "+diffDays);
    if (Math.abs(diffDays) >= 7) {
      //copy items over
      let data = {
        order_status: "expired",
        email: doc._fieldsProto.email.stringValue,
        processEnd: doc._fieldsProto.processEnd.stringValue,
        createdDate: doc._fieldsProto.createdDate.stringValue,
        code: doc._fieldsProto.code.stringValue,
        emailOriginal: doc._fieldsProto.emailOriginal.stringValue,
        order: doc._fieldsProto.order.stringValue,
        shop: doc._fieldsProto.shop.stringValue,
        received_by: doc._fieldsProto.received_by.stringValue,
        itemsDropped: doc._fieldsProto.itemsDropped.stringValue,
        processBegin: doc._fieldsProto.processBegin.stringValue,
        receivedDate: "NONE",
        items: []
      };
      for (
        var i = 0;
        i < doc._fieldsProto.items.arrayValue.values.length;
        i++
      ) {
        let tempItem = {
          value: -1,
          flag:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.flag
              .stringValue,
          name:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name
              .stringValue,
          productid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .productid.stringValue,
          productidGIT:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .productidGIT.stringValue,
          reason:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.reason
              .stringValue,
          status:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.status
              .stringValue,
          store: doc._fieldsProto.shop.stringValue,
          variantid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .variantid.stringValue,
          variantidGIT:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .variantidGIT.stringValue,
          oldItem: {
            OLDname:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name
                .stringValue,
            OLDvariantid:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
                .variantid.stringValue,
            OLDproductid:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
                .productid.stringValue,
            OLDvariantidGIT:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
                .variantidGIT.stringValue,
            OLDproductidGIT:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
                .productidGIT.stringValue
          }
        };
        data.items.push(tempItem);
      }
      let set = db.collection("historyReturns").doc();
      batch.set(set, data);
      batch.delete(doc.ref);
    }
  });
  //commit
  await batch.commit();
}

//pull items off reselling if they've been there for 7 days
async function clearExpiredItems(db) {
  //batch for efficiency
  let batch = db.batch();
  let currentDate = dateUtil.getCurrentDate();
  let myRef = db.collection("items");
  let query = await myRef.where("status", "==", "reselling").get();
  await query.forEach(async doc => {
    //calculate time difference between current and date of entry
    let processedDate = doc._fieldsProto.dateProcessed.stringValue;
    let diffDays = dateUtil.getDateDifference(processedDate, currentDate);
    //if item has been reselling for 7 days:
    if (diffDays >= 7) {
      //mark item with status returning, write to batch
      batch.update(doc.ref, { status: "returning" });
      let store = doc._fieldsProto.store.stringValue;

      let varID = doc._fieldsProto.variantid.stringValue; //FOR LIVE: let varID = doc._fieldsProto.variantidGIT.stringValue
      let { accessToken, torontoLocation } = await inv.getAccessToken(
        db,
        storeActive
      );
      //decrement inventory
      await inv.editInventory(-1, store, varID, "", db, accessToken);
    }
  });
  //commit batch
  await batch.commit();
}

module.exports = checkExpired;