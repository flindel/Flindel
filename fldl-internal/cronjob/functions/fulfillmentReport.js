"use strict";
const emailHelper = require('./emailHelper');

async function fulfillmentReport(db) {
    let fulfillmentList = [];
    let myRef = db.collection("fulfillments");
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
    await emailHelper.sendFulfillmentEmail(fulfillmentList);
  }

  module.exports = fulfillmentReport;