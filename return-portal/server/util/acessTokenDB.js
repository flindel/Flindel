"use strict";
const { Error } = require("../error");
const { getShopHeaders } = require("./shop-headers");

async function accessTokenDB(ctx) {
  const db = ctx.db;
  const shop = ctx.query.shop;
  if (shop) {
    let tokenRef = db.collection("shop_tokens").doc(shop);
    let tokenDoc = await tokenRef.get();
    if (tokenDoc.exists) {
      return tokenDoc.get("token");
    }
  }
}

async function accessToken(ctx, next) {
  let token = await accessTokenDB(ctx);
  if (ctx.accessToken === undefined && token) {
    ctx.accessToken = token;
  }
  await next();
}

module.exports = { accessToken, accessTokenDB };
