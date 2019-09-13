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
        inventory_management: false,
        tracking_support: false,
        requires_shipping_method: true,
        format: "json"
      }
    }
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

router.get("/", async ctx => {
  ctx.body = false;
  // const { cookies } = ctx;
  // const shop = cookies.get("shop_id");
  // const accessToken = cookies.get("accessToken");
  const { shop, accessToken } = getShopHeaders(ctx);
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/fulfillment_services.json?scope=all`,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    json: true
  };
  try {
    ctx.body = await rp(option);
    //console.log("body..."+JSON.stringify(ctx.body));
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

router.delete("/", async ctx => {
  const fulservId = ctx.query.id;
  console.log("fulfillment service id:---------" + fulservId);
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "delete",
    url: `https://${shop}/${api_link}/fulfillment_services/${fulservId}.json`,
    headers: headers,
    json: true
  };
  try {
    ctx.body = await rp(option);
    //console.log("body..."+JSON.stringify(ctx.body));
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

router.post("/firestore/id", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  console.log("POST fulserv id to Firestore");
  const { shop } = getShopHeaders(ctx);
  let body = JSON.parse(ctx.query.body);
  db = ctx.db;
  let docRef = db.collection("store").doc(shop);
  docRef.set(body, { merge: true });
  ctx.body = "success";
});

router.get("/firestore/id", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  db = ctx.db;
  const { shop } = getShopHeaders(ctx);
  console.log("SHOP:", shop);
  let myRef = db.collection("store").doc(shop);
  getDoc = await myRef.get();
  ctx.body = getDoc;
});
module.exports = router;
