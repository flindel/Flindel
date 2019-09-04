const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/orders"
});

//Only used by return portal
router.get("/", async ctx => {
  // Get order info with order name (4 digit number like 1001)
  const { shop, accessToken } = getShopHeaders(ctx);
  const name = ctx.query.orderNum;
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
//change order products to be marked as a fulfillment on shopify
router.post("/fulfill", async ctx => {
  const store = ctx.query.store;
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    const db = ctx.db;
    let myRefToken = db.collection("shop_tokens").doc(shop);
    let getToken = await myRefToken.get();
    headers["X-Shopify-Access-Token"] = getToken._fieldsProto.token.stringValue;
  }
  let location_id = ctx.query.location_id;
  if (ctx.query.location_id == "null") {
    location_id = null;
  }
  const option = {
    method: "POST",
    url: `https://${store}/${api_link}/orders/${ctx.query.orderid}/fulfillments.json`,
    headers: headers,
    json: true,
    body: {
      fulfillment: {
        location_id: location_id,
        tracking_number: null,
        line_items: await JSON.parse(ctx.query.lineitem_id)
      }
    }
  };
  console.log(option.body);
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
