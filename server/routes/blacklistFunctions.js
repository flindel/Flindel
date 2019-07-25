const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/blacklist'
});

router.post('/new', async ctx => {
    db = ctx.db
    store = ctx.query.store
    id = ctx.query.id
    data = {
        store:store,
        productid: id
    }
    let setDoc = db.collection('blacklist').doc().set(data)
    ctx.body = {'success':true}
});

router.get('/list', async ctx => {
    db = ctx.db
    let store = ctx.query.store
    let products = []
    myRef = db.collection('blacklist')
    let query = await myRef.where('store','==',store).get()
    await query.forEach(async doc =>{
        products.push(doc._fieldsProto.productid.stringValue)
    })
    ctx.body = {'res':products}
})

router.delete('/', async ctx =>{
    db = ctx.db
    store = ctx.query.store
    id = ctx.query.id
    myRef = db.collection('blacklist')
    let query = await myRef.where('store','==',store).where('productid','==',id).get()
    await query.forEach(async doc =>{
        doc.ref.delete()
    })
    ctx.body = {'success':true}
})


module.exports = router;
