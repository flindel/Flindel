"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const accessTokenDB = require("../util/acessTokenDB");
const router = Router({
  prefix: "/revert"
});

router.delete("/products/", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const productid = ctx.query.id;
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  console.log("productID:---------"+productid)
  const option = {
    method: "delete",
    url: `https://${shop}/${api_link}/products/${productid}.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
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

router.get("/fulserv/firestore/id", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  console.log("HELLO");
  const db = ctx.db;
  const shop = ctx.query.shop;
  let myRef = db.collection("store").doc(shop);
  let getDoc = await myRef.get();
  console.log("getDoc", getDoc);
  ctx.body = getDoc;
});

router.get("/collections/all/", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const { cookies } = ctx;
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/smart_collections.json`,
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

router.delete("/collections/", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const smart_collection_id = ctx.query.id;
  console.log("collection ID:---------"+smart_collection_id)
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  const option = {
    method: "delete",
    url: `https://${shop}/${api_link}/smart_collections/${smart_collection_id}.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
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

router.delete("/fulserv", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const fulservId = ctx.query.id;
  console.log("fulfillment service id:---------" + fulservId);
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
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

router.get("/collections/", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  //Gets products all products from a collection
  const collectionid = ctx.query.id;
  console.log("collectionid:---------", collectionid);
  const { cookies } = ctx;
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  const option = {
    url: `https://${shop}/${api_link}/products.json?collection_id=${collectionid}&limit=250`,
    headers: {
      "X-Shopify-Access-Token": accessToken
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

//getting all scriptTag id from firebase
router.get("/scriptTag/db/ids", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  // get all scripTag ids
  let ids = [];
  const { shop, accessToken } = getShopHeaders(ctx);
  console.log("scriptTag id of shop "+shop);
  const db = ctx.db;
  let myRef = await db
    .collection("scripttag")
    .doc(shop)
    .get();
  let data = myRef.data().scripts;
  data.forEach(script => {
    ids.push(script.id);
  });
  ctx.body = { ids: ids };
});

//delete a scriptTag from shopify API
router.delete("/scriptTag/shopify", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  console.log("call delete shopify");
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  //id is the scriptTag id
  let id = ctx.query.id;
  const option = {
    method: "DELETE",
    url: `https://${shop}/${api_link}/script_tags/${id}.json`,
    headers: headers,
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

//delete certain doc in scripttag collection, should be called after deleting scriptTag from Shopify API when uninstall APP
router.get("/scriptTag/db/status", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const { shop, accessToken } = getShopHeaders(ctx);
  const db = ctx.db;
  let myRef = db.collection("scripttag").doc(shop);
  let updateFields = myRef.update({ status: "revert" });
  ctx.body = { success: true };
});
module.exports = router;
