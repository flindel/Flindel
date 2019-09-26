"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const {accessTokenDB} = require('../util/acessTokenDB');
const router = Router({
  prefix: "/products"
});

router.get("/", async ctx => {
  ctx.body = false;
  const productid = ctx.query.id;
  const { cookies } = ctx;
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx)
  // const { shop, accessToken } = getShopHeaders(ctx);
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

router.get("/ids/", async ctx => {
  const { cookies } = ctx;
  const shop = cookies.get("shop_id");
  const accessToken = cookies.get("accessToken");
  const option = {
    method: "GET",
    url: `https://${shop}/${api_link}/products.json?fields=id`,
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

//Only used by return portal
router.get("/img", async ctx => {
  // Get product img src
  const productid = ctx.query.id;
  const { cookies } = ctx;
  const shop = ctx.query.shop;
  const accessToken = await accessTokenDB(ctx)
  // const { shop, accessToken } = getShopHeaders(ctx);
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
