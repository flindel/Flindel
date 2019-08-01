const Router = require("koa-router");
const {
  calculateDistance,
  getLatLng,
  sendEmail
} = require("../serverFunctions");
const { receiveWebhook } = require("@shopify/koa-shopify-webhooks");
const { SHOPIFY_API_SECRET_KEY, SERVEO_NAME } = process.env;
const router = Router();

const webhookFulfillment = receiveWebhook({
  secret: SHOPIFY_API_SECRET_KEY,
  path: "/hookendpoint"
});

const webhookOrder = receiveWebhook({
  secret: SHOPIFY_API_SECRET_KEY,
  path: "/hookorderendpoint"
});

//listner for fulfilment webhook
router.post("/hookendpoint", webhookFulfillment, ctx => {
  let hookload = ctx.request.body;

  for (let i = 0; i < hookload.variants.length; i++) {
    //instead of variants it should be line_items
    if (hookload.variants[i].fulfillment_service == "flindel") {
      console.log("found flindel");
      let fJSON = ctx.request.body.variants;
      sendEmail(fJSON);
      fetch(
        `https://${SERVEO_NAME}.serveo.net/dbcall/update_order_database?items=${fJSON}&id=${encodeURIComponent(
          JSON.stringify(hookload.order_id)
        )}`,
        {
          method: "post"
        }
      );
    } else {
      console.log("not found");
    }
  }
  ctx.response.status = 200; //tell shopify we got payload
  ctx.body = "OK";
});

//listner for order webhook
router.post("/hookorderendpoint", webhookOrder, ctx => {
  let hookload = ctx.request.body;

  let address =
    hookload.shipping_address.address1 +
    "," +
    hookload.shipping_address.city +
    "," +
    hookload.shipping_address.province;

  let latlng = getLatLng(address);
  latlng = latlng.results[0].geometry.location;
  let validLocation = calculateDistance(latlng);
  //console.log(distance);
  if (validLocation == false) {
    console.log("TOO FAR");
    fetch(
      `https://${SERVEO_NAME}.serveo.net/orders/cancel?id=${encodeURIComponent(
        JSON.stringify(hookload.id)
      )}`,
      {
        method: "post"
      }
    );
  }
  ctx.response.status = 200;
  ctx.body = "OK";
});

module.exports = router;
