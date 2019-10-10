'use strict';
const emailHelper = require('./emailHelper');
const dateUtil = require('../util/dateUtil');
const inv = require("./editInventory");
const mainHelper = require("./mainHelper");

//update inv for reselling items
async function updateInventory(items, db) {
    for (var i = 0; i < items.length; i++) {
      let idActive = items[i].variantid.stringValue; //let idActive = items[i].variantidGIT.stringValue CHANGE IT TO THIS ONE WHEN WE ACTUALLY HAVE DUPLICATES
      let storeActive = items[i].store;
      let { accessToken, torontoLocation } = await inv.getAccessToken(
        db,
        storeActive
      );
      let invId = await inv.getInvID(storeActive, idActive, accessToken);
      inv.increment(1, torontoLocation, invId, storeActive);
    }
}


  //add item to items database
async function addItems(items, status, db) {
    let currentDate = dateUtil.getCurrentDate();
    //efficiency
    let batch = db.batch();
    for (var i = 0; i < items.length; i++) {
      let item = items[i];
      let data = {
        name: item.name.stringValue,
        variantid: item.variantid.stringValue,
        variantidGIT: item.variantidGIT.stringValue,
        productid: item.productid.stringValue,
        productidGIT: item.productidGIT.stringValue,
        store: item.store,
        status: status,
        dateProcessed: currentDate,
        shipmentCode: ""
      };
      let setDoc = db.collection("items").doc();
      batch.set(setDoc, data);
    }
    await batch.commit();
}


//update flindel inventory on which items have been accepted. update shopify inventory for reselling items
async function itemUpdate(db) {
    let items = await mainHelper.getItems(db);
    let [acceptedItems, returningItems] = await mainHelper.breakdown(db, items);
    await addItems(returningItems, "returning", db);
    await updateInventory(acceptedItems, db);
    await addItems(acceptedItems, "reselling", db);
    await mainHelper.sortNewItems(acceptedItems, db);
}

//send information about which items need to be refunded
async function refundInformation(db) {
    let myRef = db.collection("pendingReturns");
    let query = await myRef.get();
    let refundItems = [];
    let specialItems = [];
    await query.forEach(async doc => {
      let orderRefundItems = [];
      let orderRejectItems = [];
      let allItems = doc._fieldsProto.items.arrayValue.values;
      for (var i = 0; i < allItems.length; i++) {
        let tempItem = allItems[i].mapValue.fields;
        tempItem.store = doc._fieldsProto.shop.stringValue;
        tempItem.order = doc._fieldsProto.order.stringValue;
        if (tempItem.value.integerValue == -1) {
          orderRejectItems.push(tempItem);
        } else if (tempItem.value.integerValue == 1) {
          if (tempItem.status.stringValue == "rejected") {
            orderRejectItems.push(tempItem);
          } else if (tempItem.status.stringValue == "special") {
            orderRejectItems.push(tempItem);
            specialItems.push(tempItem);
          } else if (
            tempItem.status.stringValue == "returning" ||
            tempItem.status.stringValue == "accepted"
          ) {
            orderRefundItems.push(tempItem);
            refundItems.push(tempItem);
          }
        }
      }
      //send email to customer about what stuff got accepted
      emailHelper.sendUpdateEmail(
        doc._fieldsProto.email.stringValue,
        orderRefundItems,
        orderRejectItems
      );
    });
    //send email to store asking refund
    await mainHelper.sortRefundItems(refundItems, db);
    //send email to flindel warehouse asking to process special items manually
    await emailHelper.sendSpecialEmail(specialItems);
}

//wipe pending, everything has been dealt with by this point
async function clearPending(db) {
    let batch = db.batch();
    let myRef = db.collection("pendingReturns"); //duplicate to history
    let query = await myRef.get();
    await query.forEach(async doc => {
      //copy each entry over
      let data = {
        order_status: doc._fieldsProto.email.stringValue,
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
        receivedDate: doc._fieldsProto.receivedDate.stringValue,
        items: []
      };
      for (var i = 0; i < doc._fieldsProto.items.arrayValue.values.length; i++) {
        let tempItem = {
          value:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.value
              .integerValue,
          flag:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.flag
              .stringValue,
          name:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name
              .stringValue,
          productid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.productid
              .stringValue,
          productidGIT:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .productidGIT.stringValue,
          reason:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.reason
              .stringValue,
          status:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.status
              .stringValue,
          store:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.store
              .stringValue,
          variantid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.variantid
              .stringValue,
          variantidGIT:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .variantidGIT.stringValue,
          oldItem: {
            OLDname:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
                .mapValue.fields.OLDname.stringValue,
            OLDvariantid:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
                .mapValue.fields.OLDvariantid.stringValue,
            OLDproductid:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
                .mapValue.fields.OLDproductid.stringValue,
            OLDvariantidGIT:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
                .mapValue.fields.OLDvariantidGIT.stringValue,
            OLDproductidGIT:
              doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem
                .mapValue.fields.OLDproductidGIT.stringValue
          }
        };
        data.items.push(tempItem);
      }
      //write to history, delete from pending
      let set = db.collection("historyReturns").doc();
      batch.set(set, data);
      batch.delete(doc.ref);
    });
    await batch.commit();
  }


//handle anything in pending after confirming checkover is done
async function handlePending(db) {
    let checked = true;
    let myRef = db.collection("pendingReturns").limit(1);
    let query = await myRef.get();
    //see if the checkover has been done
    await query.forEach(doc => {
      if (
        doc._fieldsProto.items.arrayValue.values[0].mapValue.fields.value
          .integerValue == 0
      ) {
        checked = false;
      }
    });
    //only move forward if the checkover is done
    if (checked == true) {
      await itemUpdate(db);
      await refundInformation(db);
      await clearPending();
    }
  }

  module.exports = handlePending;