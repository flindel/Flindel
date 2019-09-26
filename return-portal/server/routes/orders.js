"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const { accessTokenDB } = require("../util/acessTokenDB");
const router = Router({
  prefix: "/orders"
});

//Only used by return portal
router.get("/", async ctx => {
  // Get order info with order name (4 digit number like 1001)
  // const shop = ctx.query.shop;
  // const accessToken = await accessTokenDB(ctx);
  console.log("called get orders")
  //const { shop, accessToken } = getShopHeaders(ctx);
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  const name = ctx.query.orderNum;
  console.log("accessToken "+accessToken);
  console.log("shop "+shop);
  const option = {
    url: `https://${shop}/${api_link}/orders.json?name=${name}&status=any`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true
  };
  try {
    ctx.body = await rp(option);
  } catch (err) {
    console.log(err.message);
    if (err instanceof errors.StatusCodeError) {
      ctx.status = err.statusCode;
      ctx.message = err.message;
    } else if (err instanceof errors.RequestError) {
      ctx.status = 500;
      ctx.message = err.message;
    }
  }
});

module.exports = router;
