const Router = require("koa-router");
const { calculateDistance, getLatLng } = require("../serverFunctions");
const { receiveWebhook } = require("@shopify/koa-shopify-webhooks");
const { SHOPIFY_API_SECRET_KEY, SERVEO_NAME, API_URL } = process.env;
const router = Router();

const webhookFulfillment = receiveWebhook({
  secret: SHOPIFY_API_SECRET_KEY,
  path: "/hookendpoint"
});

const webhookOrder = receiveWebhook({
  secret: SHOPIFY_API_SECRET_KEY,
  path: "/hookorderendpoint"
});

const webhookTheme = receiveWebhook({
  secret: SHOPIFY_API_SECRET_KEY,
  path: "/hookthemeendpoint"
});

//listner for fulfilment webhook
router.post("/hookendpoint", webhookFulfillment, ctx => {
  let hookload = ctx.request.body;

  for (let i = 0; i < hookload.line_items.length; i++) {
    //if flindel item is sold
    if (hookload.line_items[i].fulfillment_service == "flindel") {
      console.log("found flindel");
      fetch(
        `${API_URL}/dbcall/update_order_database?items=${encodeURIComponent(
          JSON.stringify(hookload.line_items)
        )}&destination=${encodeURIComponent(
          JSON.stringify(hookload.destination)
        )}&fulf_id=${encodeURIComponent(
          hookload.id
        )}&order_id=${encodeURIComponent(
          hookload.order_id
        )}&source=${encodeURIComponent(ctx.header["x-shopify-shop-domain"])}`,
        {
          method: "post"
        }
      );
    } else {
      console.log("not found");
    }
  }
  ctx.response.status = 200; //tell shopify we got payload
  ctx.response.body = "OK";
});

//listner for order webhook
router.post("/hookorderendpoint", webhookOrder, async ctx => {
  let hookload = ctx.request.body;
  let foundFlindel = false;
  //create list of flindel GIT items and list of line item ID
  let flindelItems = [];
  let lineItemsID = [];
  for (let i = 0; i < hookload.line_items.length; i++) {
    if (hookload.line_items[i].fulfillment_service == "flindel") {
      foundFlindel = true;
      let orderObject = {
        title: hookload.line_items[i].title,
        id: hookload.line_items[i].id,
        quantity: hookload.line_items[i].quantity
      };
      flindelItems.push(orderObject);
      let lineObject = { id: hookload.line_items[i].id };
      lineItemsID.push(lineObject);
    }
  }

  if (foundFlindel == true) {
    let address =
      hookload.shipping_address.address1 +
      "," +
      hookload.shipping_address.city +
      "," +
      hookload.shipping_address.province;

    let latlng = await getLatLng(address);
    latlng = latlng.results[0].geometry.location;
    let validLocation = calculateDistance(latlng);
    if (validLocation == false) {
      console.log("TOO FAR");
      fetch(
        `${API_URL}/send/brand?package=${encodeURIComponent(
          JSON.stringify(flindelItems)
        )}&store=${encodeURIComponent(
          ctx.header["x-shopify-shop-domain"]
          //use order name for refund email
        )}&orderid=${encodeURIComponent(hookload.name)}`,
        {
          method: "post"
        }
      );
    } else {
      //location is valid
      fetch(
        `${API_URL}/orders/fulfill?location_id=${encodeURIComponent(
          hookload.location_id
        )}&lineitem_id=${encodeURIComponent(
          JSON.stringify(lineItemsID)
        )}&orderid=${encodeURIComponent(
          hookload.id
        )}&store=${encodeURIComponent(ctx.header["x-shopify-shop-domain"])}`,
        {
          method: "post"
        }
      ).then(function(Response) {
        console.log(Response);
      });
    }
  }
  ctx.response.status = 200;
  ctx.response.body = "OK";
});
//listner for theme webhook
router.post("/hookthemeendpoint", webhookTheme, ctx => {
  let hookload = ctx.request.body;
});
module.exports = router;
