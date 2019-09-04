const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/shop"
});

router.get('/id/', async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  ctx.body = JSON.stringify({shop_id: shop});
});

//save myshopify domain in db
router.get("/domain", async ctx => {
  const { shop, accessToken } = getShopHeaders(ctx);
  db = ctx.db;
  let data = {
    myshopifyDomian: shop
  };
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/shop.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true
  };
  try {
    let res = await rp(option);
    const primaryDomian = res.shop.domain;
    setDoc = db
      .collection("shopDomain")
      .doc(primaryDomian)
      .set(data);
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

router.get("/myshopifydomain", async ctx => {
  db = ctx.db;
  const shop = ctx.query.shop;
  console.log(shop);
  myRef = db.collection("shopDomain");
  let query = await myRef.doc(shop).get();
  //console.log(query._fieldsProto.myshopifyDomain.stringValue)
  ctx.body = {
    myshopifyDomain: query._fieldsProto.myshopifyDomain.stringValue
  };
});

router.get("/returnPolicy", async ctx => {
  //console.log("find return policy")
  //const { cookies } = ctx;
  const shop = ctx.query.shop;
  //const shop = cookies.get('shop_id');
  db = ctx.db;
  myRef = db.collection("store");
  let query = await myRef.doc(shop).get();
  ctx.body = {
    res: query._fieldsProto.returnPolicy,
    default: query._fieldsProto.defaultReturn
  };
});

router.get("/all", async ctx => {
  let db = ctx.db;
  let myRef = db.collection("store");
  let query = await myRef.get();
  let stores = [];
  await query.forEach(async doc => {
    stores.push(doc.id);
  });
  for (var i = 0; i < stores.length; i++) {
    let ind = stores[i].indexOf(".myshopify.com");
    if (ind > 0) {
      stores[i] = stores[i].substring(0, ind);
    }
  }
  ctx.body = stores;
});

router.post("/onboardingStep", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const { shop } = getShopHeaders(ctx);
  let body = JSON.parse(ctx.query.body);
  db = ctx.db;
  let docRef = db.collection("store").doc(shop);
  docRef.set(body, { merge: true });
  ctx.body = "success";
});

router.get("/onboardingStep", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  db = ctx.db;
  const { shop } = getShopHeaders(ctx);
  let myRef = db.collection("store").doc(shop);
  getDoc = await myRef.get();
  ctx.body = getDoc;
});

module.exports = router;
