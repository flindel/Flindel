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
  //   const shop = ctx.query.shop;
  //   const accessToken = await accessTokenDB(ctx)
  const { shop, accessToken } = getShopHeaders(ctx);
  db = ctx.db;
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
  varID = ctx.query.varID;
  productID = ctx.query.productID;
  let [pOriginal, pGit, vOriginal, vGit] = await mainHelper.getGITInformation(
    ctx.db,
    varID,
    productID
  );
  ctx.body = { variant: vGit, product: pGit };
});

router.get('/all', async ctx=>{
  const {shop, accessToken} = getShopHeaders(ctx);
  console.log(shop)
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

router.get("/ids/", async ctx => {
  const {shop, accessToken} = getShopHeaders(ctx);
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
  const { shop, accessToken } = getShopHeaders(ctx);
  db = ctx.db;
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
    url: `https://${shop}/${api_link}/products.json`,
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

router.post("/variant/", async ctx => {
  const product_id = ctx.query.id;
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
    url: `https://${shop}/${api_link}/products/${product_id}/variants.json`,
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

router.delete("/variant/", async ctx => {
  const product_id = ctx.query.id;
  const variant_id = ctx.query.variant_id
  const { shop, accessToken } = getShopHeaders(ctx);
  const option = {
    method: "delete",
    url: `https://${shop}/${api_link}/products/${product_id}/variants/${variant_id}.json`,
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

router.put("/", async ctx => {
  const productid = ctx.query.id;
  console.log("productID:---------" + productid);
  const { shop, accessToken } = getShopHeaders(ctx);
  const headers = {};
  if (process.env.DEBUG) {
    headers["Authorization"] = process.env.SHOP_AUTH;
  } else {
    headers["X-Shopify-Access-Token"] = accessToken;
  }
  const option = {
    method: "PUT",
    url: `https://${shop}/${api_link}/products/${productid}.json`,
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

router.delete("/", async ctx => {
  const productid = ctx.query.id;
  console.log("productID:---------"+productid)
  const { shop, accessToken } = getShopHeaders(ctx);
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

module.exports = router;
