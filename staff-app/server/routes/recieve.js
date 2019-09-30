"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const BodyParser = require("koa-bodyparser");
const { getShopHeaders } = require("../util/shop-headers");

const router = Router({
  prefix: "/recieve"
});
router.use(BodyParser());
//tracking numbers
router.get("/fetch_tracking_numbers", async ctx => {
  var order_names = JSON.stringify(ctx.query);
  order_names = JSON.parse(order_names.replace("order_names[]", "order_names"));
  console.log(order_names.order_names);

  try {
    ctx.body = {
      tracking_numbers: {
        "#1001.1": "qwerty",
        "#1002.1": "asdfg",
        "#1003.2": "zxcvb"
      },
      message: "Successfully received the tracking numbers",
      success: true
    }; //for testing qwerty and such should come from the database//gets sent to shopify automatically
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
//give stock info
//console.log("TEEEEEEEEESSSSSSSTT");
router.get("/fetch_stock", async ctx => {
  var sku = ctx.query.sku;
  try {
    if (sku == null) {
      ctx.body = { "123": 1000, "456": 500 }; //all skus
    } else {
      ctx.body = { "123": 1000 }; //only for paticular sku
    }
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
