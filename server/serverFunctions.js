const dotenv = require("dotenv");
const turf = require("@turf/turf");
dotenv.config();
const {
  receiveWebhook,
  registerWebhook
} = require("@shopify/koa-shopify-webhooks");
const GOOGLE_GEO_API_KEY = process.env.GOOGLE_GEO_API_KEY;
const serveo_name = "suus";

async function getLatLng(address) {
  console.log(GOOGLE_GEO_API_KEY);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_GEO_API_KEY}`
  );
  const json = await response.json();
  return json;
}

function calculateDistance(p1) {
  let pt = turf.point([p1.lat, p1.lng]);
  let poly = turf.polygon([
    [
      [44.0502601, -79.5312458],
      [43.6535273, -79.9723667],
      [43.38117, -79.9800032],
      [43.9482713, -79.0184346]
    ]
  ]);
  return turf.booleanPointInPolygon(pt, poly);
}

function sendEmail(json) {
  fetch(
    `https://${serveo_name}.serveo.net/sendEmail?package=${encodeURIComponent(
      JSON.stringify(json)
    )}`,
    {
      method: "post"
    }
  )
    //.then(data => console.log("Data: ", data))
    .catch(error => console.log("error", error));
}

function cancelOrder() {}

function warehouseOrder() {
  fetch(`https://${serveo_name}.serveo.net/dbcall/warehouse_order`, {
    method: "post"
  });
}

function setupWebhooks(accessToken, shop) {
  const registration = registerWebhook({
    address: "https://suus.serveo.net/hookendpoint",
    topic: "FULFILLMENTS_CREATE",
    accessToken,
    shop
  });
  // const registration = await registerWebhook({
  //   address: "https://suus.serveo.net/hookendpoint",
  //   topic: "PRODUCTS_CREATE",
  //   accessToken,
  //   shop
  // });
  if (registration.success) {
    console.log("webhooks registered");
  } else {
    console.log("Failed to webhook ", registration.result);
  }
  const registration1 = registerWebhook({
    address: "https://suus.serveo.net/hookorderendpoint",
    topic: "ORDERS_CREATE",
    accessToken,
    shop
  });
  if (registration1.success) {
    console.log("webhooks registered");
  } else {
    console.log("Failed to webhook ", registration1.result);
  }
}

module.exports.setupWebhooks = setupWebhooks;
module.exports.warehouseOrder = warehouseOrder;
module.exports.calculateDistance = calculateDistance;
module.exports.sendEmail = sendEmail;
module.exports.getLatLng = getLatLng;
