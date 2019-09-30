"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const getAccessToken = require("../util/editInventory");
const mainHelper = require("../util/mainHelper");
const router = Router({
  prefix: "/products"
});

router.get("/", async ctx => {
  ctx.body = false;
  const productid = ctx.query.id;
  const { cookies } = ctx;
  const shop = ctx.query.shop;
  const { accessToken, torontoLocation } = await getAccessToken.getAccessToken(
    ctx.db,
    shop
  );
  //const { shop, accessToken } = getShopHeaders(ctx);
  const db = ctx.db;
  const option = {
    method: "GET",
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

router.get('/all', async ctx=>{
  //const {shop, accessToken} = getShopHeaders(ctx);
  const shop = ctx.query.shop;
  const { accessToken, torontoLocation } = await getAccessToken.getAccessToken(
    ctx.db,
    shop
  );
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/products.json`,
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

router.get("/variant/exists", async ctx => {
  ctx.body = false;
  const id = ctx.query.id;
  const store = ctx.query.store;
  const { accessToken, torontoLocation } = await getAccessToken.getAccessToken(
    ctx.db,
    store
  );
  const option = {
    method: "GET",
    url: `https://${store}/${api_link}/variants/${id}.json`,
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

router.get("/variant/productID", async ctx => {
  const varID = ctx.query.id;
  const shop = ctx.query.store;
  const { accessToken, torontoLocation } = await getAccessToken.getAccessToken(
    ctx.db,
    shop
  );
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/variants/${varID}.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true
  };
  ctx.body = await rp(option);
});

router.get("/GITinformation", async ctx => {
  const varID = ctx.query.varID;
  const productID = ctx.query.productID;
  let [pOriginal, pGit, vOriginal, vGit] = await mainHelper.getGITInformation(
    ctx.db,
    varID,
    productID
  );
  ctx.body = { variant: vGit, product: pGit };
});

router.get("/img", async ctx => {
  // Get product img src
  const productid = ctx.query.id;
  const shop = ctx.query.shop;
  const { accessToken, torontoLocation } = await getAccessToken.getAccessToken(
    ctx.db,
    shop
  );
  const db = ctx.db;
  console.log(accessToken);
  const option = {
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


module.exports = router;
