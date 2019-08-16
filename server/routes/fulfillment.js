const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');

const router = Router({
    prefix: '/fulfillment'
});

router.get('/', async ctx => {
    db = ctx.db
    code = ctx.query.workerID
    let orders = []
    myRef = db.collection('fulfillments')
    let query = await myRef.where('workerid','==',code).get()
    await query.forEach(async doc=>{
        orders.push(doc._fieldsProto)
    })
    ctx.body = orders
});

router.put('/update',async ctx=>{
    db = ctx.db
    let batch = db.batch()
    let myRef = db.collection('fulfillments')
    orders = await JSON.parse(ctx.query.orders)
    for (var i = 0;i<orders.length;i++){
        let query = await myRef.where('code','==',orders[i].code).get()
        await query.forEach(async doc=>{
            batch.delete(doc.ref)
        })
        let newDoc = myRef.doc()
        batch.set(newDoc,orders[i])
    }
    batch.commit()
    ctx.body = true
})

module.exports = router;

router.post('/complete',async ctx=>{
    db = ctx.db
    let batch = db.batch()
    ctx.body = true
})
