const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");

const router = Router({
  prefix: "/scriptTag"
});

//!!!!!!!!import should change this to '/shopify after finish'
router.post("/shopify", async ctx => {
  // post a scripttag to shopify
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }

  const option = {
    method: "POST",
    url: `https://${shop}/${api_link}/script_tags.json`,
    headers: headers,
    json: true,
    body: ctx.request.body
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

//delete a scriptTag from shopify API
router.delete("/shopify", async ctx => {
  console.log("call delete shopify");
  const { shop, accessToken } = getShopHeaders(ctx);
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

//get all scriptTags' src for a shop
router.get("/db/src", async ctx => {
  //let shop = ctx.query.shop;
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  db = ctx.db;
  let myRef = db.collection("scripttag").doc(shop);
  try {
    getDoc = await myRef.get();
    ctx.body = getDoc.data().src;
    console.log(JSON.stringify(ctx.body));
  } catch (err) {
    console.log("Err on getting doc in scripttag collection", err);
  }

  //update scripttags id and other info after posting to shopify
  router.put("/db/updateid", async ctx => {
    const { shop, accessToken } = getShopHeaders(ctx);
    const headers = {};
    if (process.env.DEBUG) {
      headers["Authorization"] = process.env.SHOP_AUTH;
    } else {
      headers["X-Shopify-Access-Token"] = accessToken;
    }
    let resp = await JSON.parse(ctx.query.resp);
    console.log("called");
    db = ctx.db;
    let myRef = db.collection("scripttag").doc(shop);
    updateFields = myRef.update({ scripts: resp });
    updateStatus = myRef.update({ status: "active" });
    ctx.body = { success: true };
  });

  //delete certain doc in scripttag collection, should be called after deleting scriptTag from Shopify API when uninstall APP
  router.get("/db/status", async ctx => {
    const { shop, accessToken } = getShopHeaders(ctx);
    db = ctx.db;
    let myRef = db.collection("scripttag").doc(shop);
    let updateFields = myRef.update({ status: "revert" });
    ctx.body = { success: true };
  });
});

//getting all scriptTag id. !!!!!TESTING function for Aug 1st meeting
router.get("/db/ids", async ctx => {
  // get all scripTag ids
  let ids = [];
  const { shop, accessToken } = getShopHeaders(ctx);
  console.log("call db ids");
  db = ctx.db;
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

module.exports = router;
