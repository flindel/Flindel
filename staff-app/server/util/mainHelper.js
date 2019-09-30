"use strict"
const emailHelper = require("./emailHelper");

//get items that have been processed and are in pending
async function getItems(dbIn) {
  let itemList = [];
  const db = dbIn;
  let myRef = db.collection("pendingReturns");
  let query = await myRef.get();
  await query.forEach(async doc => {
    let items = doc._fieldsProto.items.arrayValue.values;
    for (var i = 0; i < items.length; i++) {
      let tempItem = items[i].mapValue.fields;
      tempItem.order = doc._fieldsProto.order.stringValue;
      tempItem.store = doc._fieldsProto.shop.stringValue;
      tempItem.code = doc._fieldsProto.code.stringValue;
      itemList.push(tempItem);
    }
  });
  return itemList;
}

//split items into accepted, return, refund lists
async function breakdown(db, items) {
  let acceptedList = [];
  let returningList = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].value.integerValue == 1) {
      if (items[i].status.stringValue == "accepted") {
        acceptedList.push(items[i]);
      } else if (items[i].status.stringValue == "returning") {
        returningList.push(items[i]);
      }
    }
  }
  return [acceptedList, returningList];
}

//get get it today information for items
async function getGITInformation(db, variantid, productid) {
  let productid_original = productid;
  let productid_git = "1";
  let variantid_original = variantid;
  let variantid_git = "2";
  let myRef = db.collection("products");
  let query = await myRef.where("orig_id", "==", productid).get();
  if (query.empty) {
    let query2 = await myRef.where("git_id", "==", productid).get();
    await query2.forEach(async doc => {
      //item coming in is already a GIT item, has git var id
      productid_original = doc._fieldsProto.orig_id.stringValue;
      productid_git = productid;
      for (
        var i = 0;
        i < doc._fieldsProto.variants.arrayValue.values.length;
        i++
      ) {
        let temp = doc._fieldsProto.variants.arrayValue.values[
          i
        ].mapValue.fields.git_var.integerValue.toString();
        if (temp == variantid) {
          variantid_original = doc._fieldsProto.variants.arrayValue.values[
            i
          ].mapValue.fields.orig_var.integerValue.toString();
        }
      }
      variantid_git = variantid;
    });
  } else {
    await query.forEach(async doc => {
      //item coming in is an original id
      productid_original = productid;
      productid_git = doc._fieldsProto.git_id.stringValue;
      for (
        var i = 0;
        i < doc._fieldsProto.variants.arrayValue.values.length;
        i++
      ) {
        let temp = doc._fieldsProto.variants.arrayValue.values[
          i
        ].mapValue.fields.orig_var.integerValue.toString();
        if (temp == variantid) {
          variantid_git = doc._fieldsProto.variants.arrayValue.values[
            i
          ].mapValue.fields.git_var.integerValue.toString();
        }
      }
      variantid_original = variantid;
    });
  }
  return [productid_original, productid_git, variantid_original, variantid_git];
}

//combine items in list so that there's only one entry per item and higher quantities
async function combine(items) {
  for (var i = 0; i < items.length; i++) {
    for (var j = i + 1; j < items.length; j++) {
      if (
        items[i].variantid == items[j].variantid &&
        items[i].store == items[j].store
      ) {
        items[i].quantity++;
        items.splice(j, 1);
        j--;
      }
    }
  }
  return items;
}

//sort items that need to be refunded by store and order, send email to various stores
async function sortRefundItems(items, db) {
  let currList = [];
  let storeItems = [];
  while (items.length > 0) {
    //this part gets all the items in one store together, puts them in currList
    currList = [];
    storeItems = [];
    let currStore = items[0].store;
    for (var i = 0; i < items.length; i++) {
      if (items[i].store == currStore) {
        currList.push(items[i]);
        items.splice(i, 1);
        i--;
      }
    }
    let currItemsList = [];
    //at this point, all the items are one store, we do the same thing to group by order to help brand
    while (currList.length > 0) {
      currItemsList = [];
      let currNum = currList[0].order;
      for (var i = 0; i < currList.length; i++) {
        if (currList[i].order == currNum) {
          currItemsList.push(currList[i]);
          currList.splice(i, 1);
          i--;
        }
      }
      //once an order is taken care of, add it to the list
      let currOrder = {
        orderNum: currNum,
        refundItems: currItemsList
      };
      storeItems.push(currOrder);
    }
    //send the email to the store about who to refund
    sendRefundEmail(storeItems, currStore, db);
  }
}

//sort items that were received by store, send email to various stores
async function sortNewItems(items, dbIn) {
  while (items.length > 0) {
    let currList = [];
    let storeItems = [];
    let currStore = items[0].store;
    for (var i = 0; i < items.length; i++) {
      items[i].quantity = 1;
      if (items[i].store == currStore) {
        currList.push(items[i]);
        items.splice(i, 1);
        i--;
      }
    }
    for (var i = 0; i < items.length; i++) {
      for (var j = i + 1; j < items.length; j++) {
        if (items[i].variantid.stringValue == items[j].variantid.stringValue) {
          items[i].quantity++;
          items.splice(j, 1);
          j--;
        }
      }
    }
    sendItemEmail(currList, currStore, dbIn);
  }
}

//send email to brand about items that are going to be put up for resale
async function sendItemEmail(listIn, store, db) {
  let email = await emailHelper.getStoreEmail(db, store);
  emailHelper.sendItemEmail(listIn, email);
}

//send email to brand about which customers/orders need to be refunded because we accepted the item
async function sendRefundEmail(listIn, store, db) {
  let email = await emailHelper.getStoreEmail(db, store);
  emailHelper.sendRefundEmail(listIn, email);
}

module.exports = {
  getItems,
  breakdown,
  combine,
  sortRefundItems,
  sortNewItems,
  getGITInformation
};
