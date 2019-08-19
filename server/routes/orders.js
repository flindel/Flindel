const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/orders"
});

router.get("/", async ctx => {
  // Get all orders
  const { shop, accessToken } = getShopHeaders(ctx);
  const option = {
    url: `https://${shop}/${api_link}/orders.json`,
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

router.post("/fulfill", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = "8ed9510afbb7250e2ecdbfe9317fe983";
  }
  const option = {
    url: `https://databasecommunicationtest.myshopify.com/${api_link}/orders/${
      ctx.query.orderid
    }/fulfillments.json`,
    headers: headers,
    json: true,
    body: {
      fulfillment: {
        location_id: ctx.query.location_id,
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
