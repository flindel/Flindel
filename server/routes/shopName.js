const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/shopName'
});

//this will likely be used on an onMount for the return portal so we can determine what header logo, return policy etc to import
router.get('/', async ctx => {
    // Get all orders
    const { shop, accessToken } = getShopHeaders(ctx);
    ctx.body = {shopName:shop}
    });


module.exports = router;