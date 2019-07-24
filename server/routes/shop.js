const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/shop'
});

router.get('/id/', async ctx => {
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  ctx.body = JSON.stringify({shop_id: shop});
});

router.get('/token', async ctx =>{
    db = ctx.db
    storename = ctx.query.name
    myRef = db.collection('shop_tokens').doc(storename);
    getDoc = await myRef.get()
    ctx.body = {"token" : getDoc._fieldsProto.token.stringValue, "tLocation":getDoc._fieldsProto.torontoLocation.stringValue}
})

router.get('/returnPolicy', async ctx =>{
    const { shop, accessToken } = getShopHeaders(ctx);
    db = ctx.db
    myRef = db.collection('returnPolicy').where('store','==',shop)
    query = await myRef.get()
    query.forEach(async doc =>{
        ctx.body = {'res': doc._fieldsProto.special, 'default':doc._fieldsProto.default}
    })
})

router.get('/email', async ctx =>{
  db = ctx.db
    store = ctx.query.store
    myRef = db.collection('shop_tokens').doc(store)
    let query = await myRef.get()
    ctx.body = {'email':query._fieldsProto.email.stringValue}
})

router.post('/install_time/', async ctx =>{
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  let body = JSON.parse(ctx.query.body);
  let db = ctx.db
  let setDoc = db.collection('shop_tokens').doc(body.shop_id+"").set(
    {
      install_time: body.install_time
    }, {merge:true});
  ctx.body = 'success'
})

module.exports = router;
