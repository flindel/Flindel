const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");

const router = Router({
  prefix: "/collections"
});

router.get("/", async ctx => {
  //Gets products all products from a collection
  const collectionid = ctx.query.id;
  console.log("collectionid:---------", collectionid);
  const { shop, accessToken } = getShopHeaders(ctx);
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

router.post("/", async ctx => {
  // Create a product
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "POST",
    url: `https://${shop}/${api_link}/smart_collections.json`,
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


      
  router.get('/all/', async ctx => {
    const { shop, accessToken } = getShopHeaders(ctx);
    const option = {
        method: 'GET',
        url: `https://${shop}/${api_link}/smart_collections.json`,
        headers: {
          'X-Shopify-Access-Token': accessToken
        },
        json: true,
    }
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


router.delete("/", async ctx => {
  const smart_collection_id = ctx.query.id;
  console.log("collection ID:---------" + smart_collection_id);
  const { cookies } = ctx;
  const shop = cookies.get("shop_id");
  const accessToken = cookies.get("accessToken");
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
module.exports = router;
