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
    let docToUpdate = db.collection('store').doc(store)
    updateFields = docToUpdate.update({blacklist:items})
    ctx.body = {'success':true}
});

router.get('/', async ctx => {
    db = ctx.db
    let store = ctx.query.store
    let products = []
    myRef = db.collection('store')
    let query = await myRef.doc(store).get()
    if (query._fieldsProto){
        for (var i = 0;i<query._fieldsProto.blacklist.arrayValue.values.length;i++){
        products.push(query._fieldsProto.blacklist.arrayValue.values[i].stringValue)
        }
    }
    ctx.body = {'res':products}
})


module.exports = router;
