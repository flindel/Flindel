const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/orders'
});

router.get('/', async ctx => {
    // Get all orders
    const { shop, accessToken } = getShopHeaders(ctx);
    const option = {
        url: `https://${shop}/${api_link}/orders.json`,
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

module.exports = router;