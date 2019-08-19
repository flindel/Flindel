const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/worker'
});

router.get('/check', async ctx => {
    let db = ctx.db
    let id = ctx.query.id
    let myRef = db.collection('worker')
    let found = false
    let query = await myRef.where('id','==',id).get()
    await query.forEach(async doc=>{
        found = true
    })
    ctx.body = found
});


module.exports = router;