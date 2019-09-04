const serveoname = "04071318.serveo.net";
const rp = require("request-promise");
const { api_link } = require("../default-shopify-api.json");
const emailHelper = require("./emailHelper");
const expiredHelper = require("./expiredHelper");
const inv = require("./editInventory");
const mainHelper = require("./mainHelper");

//get rid of anything that's been in orders/items for over 7 days
async function checkExpired(db) {
  expiredHelper.clearExpiredItems(db);
  expiredHelper.clearExpiredOrders(db);
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
    itemUpdate(db);
    refundInformation(db);
    clearPending();
  }
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
  mainHelper.sortRefundItems(refundItems, db);
  emailHelper.sendSpecialEmail(specialItems);
}

//update flindel inventory on which items have been accepted. update shopify inventory for reselling items
async function itemUpdate(db) {
  let items = await mainHelper.getItems(db);
  let [acceptedItems, returningItems] = await mainHelper.breakdown(db, items);
  addItems(returningItems, "returning", db);
  updateInventory(acceptedItems, db);
  addItems(acceptedItems, "reselling", db);
  mainHelper.sortNewItems(acceptedItems, db);
}

//notify of all items marked returning so we know when to send shipments back
async function returningReport(dbIn) {
  let returningList = [];
  db = dbIn;
  myRef = db.collection("items");
  let query = await myRef.get();
  await query.forEach(async doc => {
    if (doc._fieldsProto.status.stringValue == "returning") {
      tempItem = {
        variantid: doc._fieldsProto.variantid.stringValue,
        name: doc._fieldsProto.name.stringValue,
        store: doc._fieldsProto.store.stringValue,
        quantity: 1
      };
      returningList.push(tempItem);
    }
  });
  returningList = mainHelper.combine(returningList);
}

async function fulfillmentReport(dbIn) {
  let fulfillmentList = [];
  db = dbIn;
  myRef = db.collection("fulfillments");
  let query = await myRef.get();
  await query.forEach(async doc => {
    if (doc._fieldsProto.code.stringValue == "") {
      tempOrder = {
        orderid: doc._fieldsProto.orderid.stringValue,
        name: doc._fieldsProto.name.stringValue,
        shippingAddress: doc._fieldsProto.shippingAddress.stringValue,
        store: doc._fieldsProto.store.stringValue,
        items: [],
        comment: doc._fieldsProto.comment.stringValue
      };
      for (
        var i = 0;
        i < doc._fieldsProto.items.arrayValue.values.length;
        i++
      ) {
        let tempItem = {
          name:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name
              .stringValue,
          quantity:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields.quantity
              .integerValue,
          productid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .productid.stringValue,
          variantid:
            doc._fieldsProto.items.arrayValue.values[i].mapValue.fields
              .variantid.stringValue
        };
        tempOrder.items.push(tempItem);
      }
      fulfillmentList.push(tempOrder);
    }
  });
  emailHelper.sendFulfillmentEmail(fulfillmentList);
}

//wipe pending, everything has been dealt with by this point
async function clearPending(dbIn) {
  db = dbIn;
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
  batch.commit();
}

//update inv for reselling items
async function updateInventory(items, dbIn) {
  db = dbIn;
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
async function addItems(items, status, dbIn) {
  let currentDate = expiredHelper.getCurrentDate();
  db = dbIn;
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
    setDoc = db.collection("items").doc();
    batch.set(setDoc, data);
  }
  batch.commit();
}

module.exports = { checkExpired, fulfillmentReport, handlePending };
