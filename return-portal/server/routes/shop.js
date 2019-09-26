"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/shop"
});

router.get("/myshopifydomain", async ctx => {
  const db = ctx.db;
  const shop = ctx.query.shop;
  console.log(shop);
  let myRef = db.collection("shopDomain");
  let query = await myRef.doc(shop).get();
  //console.log(query._fieldsProto.myshopifyDomain.stringValue)
  ctx.body = {
    myshopifyDomain: query._fieldsProto.myshopifyDomain.stringValue
  };
});

router.get("/returnPolicy", async ctx => {
  //console.log(ctx)
  const shop = ctx.query.shop;
  //const { cookies } = ctx;
  //const shop = cookies.get('shop_id');
  const db = ctx.db;
  let myRef = db.collection("store");
  let query = await myRef.doc(shop).get();
  ctx.body = {
    res: query._fieldsProto.returnPolicy,
    default: query._fieldsProto.defaultReturn
  };
});

module.exports = router;
