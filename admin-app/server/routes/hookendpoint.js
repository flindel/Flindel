const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const {
  receiveWebhook
} = require("../../node_modules/@shopify/koa-shopify-webhooks");

const router = Router({
  prefix: "/hookendpoint"
});

const webhook = receiveWebhook({
  path: "/hookendpoint",
  secret: process.env.SHOPIFY_API_SECRET_KEY
});

router.post("/", webhook, ctx => {
  console.log("recived webhook: ", ctx.state.webhook);
});

module.exports = router;
