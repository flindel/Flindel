const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const { SERVEO_NAME } = process.env;

const router = Router({
  prefix: "/fulserv"
});
//sets flindel as a fullfillment service
router.post("/", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "POST",
    url: `https://${shop}/${api_link}/fulfillment_services.json`,
    headers: headers,
    json: true,
    body: {
      fulfillment_service: {
        name: "Flindel",
        callback_url: `https://${SERVEO_NAME}.serveo.net/dbcall`,
        inventory_management: false,
        tracking_support: false,
        requires_shipping_method: true,
        format: "json"
      }
    }
  };
  try {
    ctx.body = await rp(option);

    console.log("ME " + JSON.stringify(ctx.body));
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

//next get a listner for webhook that will provide json info of what fullfilment was created and make email to email to us
//give tracking numbers

module.exports = router;
