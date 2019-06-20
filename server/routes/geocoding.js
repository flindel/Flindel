const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/addValidation'
});

router.get('/', async ctx => {
    // Get all orders
    //const { shop, accessToken } = getShopHeaders(ctx);
    //const {name} = ctx.params.orderNum
    //console.log(ctx.query.orderNum);
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    //await next();
    const postalCode = ctx.query.postalCode;
    console.log("postal code:---------"+postalCode)
    // const { cookies } = ctx;
     const option = {
         url: `http://nominatim.openstreetmap.org/search?q=${encodeURI(postalCode)}&format=json`,
     }

    try {
        let resp = await rp(option)
        resp = JSON.parse(resp)
        //console.log("resp+++++++++"+typeof(resp))
        //console.log("res[0]----"+resp[0])
        
        let valid = true
        //do lat and long check
        ctx.body = valid
        
        console.log("ctx-------"+ctx.body)
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