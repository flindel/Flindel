const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");

const router = Router({
  prefix: "/cancelOrder"
});
//cancel order
router.post("/", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  const order_id = ctx.query.id;
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "POST",
    url: `https://${shop}/${api_link}/orders/#${order_id}/cancel.json`,
    headers: headers,
    json: true
  };
  try {
    ctx.body = await rp(option);

    console.log("CANCEL " + JSON.stringify(ctx.body));
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
