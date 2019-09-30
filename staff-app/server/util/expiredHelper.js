"use strict";
const inv = require("./editInventory");
const rp = require("request-promise");

//clear orders from requestedReturns that have expired
async function clearExpiredOrders(dbIn) {
  const db = dbIn;
  //batch for efficiency
  let batch = db.batch();
  let currentDate = getCurrentDate();
  let myRef = db.collection("requestedReturns");
  let query = await myRef.get();
  await query.forEach(async doc => {
    let orderDate = doc._fieldsProto.createdDate.stringValue;
    //get time elapsed since return was requested
    let diffDays = getDateDifference(currentDate, orderDate);
    //if there's a 7 day difference, return is expired
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
async function clearExpiredItems(dbIn) {
  const db = dbIn;
  //batch for efficiency
  let batch = db.batch();
  let currentDate = getCurrentDate();
  let myRef = db.collection("items");
  let query = await myRef.where("status", "==", "reselling").get();
  await query.forEach(async doc => {
    //calculate time difference between current and date of entry
    let processedDate = doc._fieldsProto.dateProcessed.stringValue;
    let diffDays = getDateDifference(processedDate, currentDate);
    //if item has been reselling for 7 days:
    if (diffDays >= 7) {
      //mark item with status returning, write to batch
      batch.update(doc.ref, { status: "returning" });
      let store = doc._fieldsProto.store.stringValue;

      let varID = doc._fieldsProto.variantid.stringValue; //FOR LIVE: let varID = doc._fieldsProto.variantidGIT.stringValue
      //decrement inventory
      inv.editInventory(-1, store, varID, "", db);
    }
  });
  //commit batch
  await batch.commit();
}

//returns current date (MM/DD/YYYY)
function getCurrentDate() {
  let currentDate = "";
  currentDate +=
    new Date().getMonth() +
    1 +
    "/" +
    new Date().getDate() +
    "/" +
    new Date().getFullYear();
  return currentDate;
}

//calculates and returns difference between two dates (time elapsed)
function getDateDifference(d1, d2) {
  const date2 = new Date(d2);
  const date1 = new Date(d1);
  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

module.exports = {
  clearExpiredItems,
  clearExpiredOrders,
  getCurrentDate,
  getDateDifference
};
