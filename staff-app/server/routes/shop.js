"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/shop"
});

router.get("/all", async ctx => {
  let db = ctx.db;
  let myRef = db.collection("store");
  let query = await myRef.get();
  let stores = [];
  await query.forEach(async doc => {
    stores.push(doc.id);
  });
  for (var i = 0; i < stores.length; i++) {
    let ind = stores[i].indexOf(".myshopify.com");
    if (ind > 0) {
      stores[i] = stores[i].substring(0, ind);
    }
  }
  ctx.body = stores;
});

module.exports = router;
