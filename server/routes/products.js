const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const router = Router({
    prefix: '/products'
});


router.get('/', async ctx => {
  // Get product img src
  const productid = ctx.query.id;
  console.log("productID:---------"+productid)
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  const accessToken = cookies.get('accessToken');
  const option = {
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


router.put('/', (ctx, next) => {
  console.log("CTX", ctx);
  const productid = ctx.query.id;
  ctx.body = JSON.stringify({
    "product":{
      "id": parseInt(productid),
      "title":"New Product title"
    }});
  console.log("productID:---------"+productid)
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  const accessToken = cookies.get('accessToken');
  const option = {
      url: `https://${shop}/${api_link}/products/${productid}.json`,
      headers: {
          'X-Shopify-Access-Token': accessToken
      },
      json: true,
  }
  //removed try catch
});



module.exports = router;
