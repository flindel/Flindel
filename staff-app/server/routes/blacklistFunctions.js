"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/blacklist"
});

router.put("/", async ctx => {
  const db = ctx.db;
  const store = ctx.query.store;
  let items = await JSON.parse(ctx.query.items);
  let docToUpdate = db.collection("store").doc(store);
  let updateFields = docToUpdate.update({ blacklist: items });
  ctx.body = { success: true };
});

router.get("/", async ctx => {
  const db = ctx.db;
  let store = ctx.query.store;
  let products = [];
  let myRef = db.collection("store");
  let query = await myRef.doc(store).get();
  if (query._fieldsProto) {
    for (
      var i = 0;
      i < query._fieldsProto.blacklist.arrayValue.values.length;
      i++
    ) {
      products.push(
        query._fieldsProto.blacklist.arrayValue.values[i].stringValue
      );
    }
  }
  ctx.body = { res: products };
});

router.get("/exists", async ctx => {
  const db = ctx.db;
  //productID comes in as integer, database only responds to string
  const target = ctx.query.id;
  const target2 = ctx.query.id2;
  const store = ctx.query.store;
  //let query = await myRef.where('productid','==',target).where('store','==',store).get()
  let myRef = db.collection("store");
  let query = await myRef.doc(store).get();
  let found = false;
  for (
    var i = 0;
    i < query._fieldsProto.blacklist.arrayValue.values.length;
    i++
  ) {
    if (
      target == query._fieldsProto.blacklist.arrayValue.values[i].stringValue ||
      target2 == query._fieldsProto.blacklist.arrayValue.values[i].stringValue
    ) {
      found = true;
    }
  }
  ctx.body = { blacklist: found };
});

module.exports = router;
