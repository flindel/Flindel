const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/blacklist'
});

router.put('/', async ctx => {
    db = ctx.db
    store = ctx.query.store
    items = await JSON.parse(ctx.query.items)
    let docToUpdate = db.collection('blacklist').doc(store)
    updateFields = docToUpdate.update({items:items})
    ctx.body = {'success':true}
});

router.get('/list', async ctx => {
    db = ctx.db
    let store = ctx.query.store
    let products = []
    myRef = db.collection('blacklist')
    let query = await myRef.doc(store).get()
    for (var i = 0;i<query._fieldsProto.items.arrayValue.values.length;i++){
        products.push(query._fieldsProto.items.arrayValue.values[i].stringValue)
    }
    ctx.body = {'res':products}
})


module.exports = router;
