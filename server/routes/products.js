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
        //`https://getordertest.myshopify.com/admin/api/2019-04/products/${this.props.item.productID}.json?fields=image`
        url: `https://${shop}/${api_link}/products/${productid}.json?fields=image`,
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