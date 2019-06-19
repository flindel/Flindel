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

router.get("/", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "GET",
    // url: `https://${shop}/${api_link}/fetch_tracking_numbers.json`,
    url: `https://${shop}/fetch_tracking_numbers.json`,
    headers: headers,
    json: true
  };
  try {
    body = await rp(option);
    console.log("GET" + JSON.stringify(body));
    ctx.body = { "#1001.1": "qwerty", "#1002.1": "asdfg", "#1003.2": "zxcvb" }; //for testing
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
router.get("/", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "GET",
    //   url: `https://${shop}/${api_link}/fetch_stock.json`,
    url: `https://${shop}/fetch_stock.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true
  };
  try {
    body = await rp(option);
    console.log("GETS" + JSON.stringify(body));
    ctx.body = { "123": 1000, "456": 500 };
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
