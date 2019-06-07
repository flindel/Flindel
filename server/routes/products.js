const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/products'
});


router.get('/', async ctx => {
  const productid = ctx.query.id;
  console.log("productID:---------"+productid)
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  const accessToken = cookies.get('accessToken');
  const option = {
      method: 'GET',
      url: `https://${shop}/${api_link}/products/${productid}.json`,
      headers: {
        'X-Shopify-Access-Token': accessToken
      },
      json: true,
  }
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

router.post('/', async ctx => {
    // Create a product
    const { shop, accessToken } = getShopHeaders(ctx);
    const headers = {};
    if (process.env.DEBUG) {
        headers['Authorization'] = process.env.SHOP_AUTH;
    } else {
        headers['X-Shopify-Access-Token'] = accessToken;
    }
    const option = {
        method: 'POST',
        url: `https://${shop}/${api_link}/products.json`,
        headers: headers,
        json: true,
        body: ctx.request.body
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

router.put('/', async ctx => {
    const productid = ctx.query.id;
    console.log("productID:---------"+productid)
    const { shop, accessToken } = getShopHeaders(ctx);
    const headers = {};
    if (process.env.DEBUG) {
        headers['Authorization'] = process.env.SHOP_AUTH;
    } else {
        headers['X-Shopify-Access-Token'] = accessToken;
    }
    const option = {
        method: 'PUT',
        url: `https://${shop}/${api_link}/products/${productid}.json`,
        headers: headers,
        json: true,
        body: ctx.request.body
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

router.delete('/', async ctx => {
  const productid = ctx.query.id;
  console.log("productID:---------"+productid)
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  const accessToken = cookies.get('accessToken');
  const option = {
      method: 'delete',
      url: `https://${shop}/${api_link}/products/${productid}.json`,
      headers: {
          'X-Shopify-Access-Token': accessToken
      },
      json: true,
  }
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
