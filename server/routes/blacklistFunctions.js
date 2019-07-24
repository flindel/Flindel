const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/blacklist'
});

router.get('/check', async ctx => {
    db = ctx.db
    id = ctx.query.id
    store = ctx.query.store
    myRef = db.collection('blacklist')
    let query = await myRef.where('productid','==',id).where('store','==',store).get()
    if (query.empty){
        ctx.body = { "blacklist":false}
    }
    else{
        ctx.body = { "blacklist":true}
    }  
});

router.get('/add', async ctx => {
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

router.get('/load', async ctx => {
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

router.get('/delete', async ctx =>{
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
