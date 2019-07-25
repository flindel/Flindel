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

router.get('/returnPolicy', async ctx =>{
    const { shop, accessToken } = getShopHeaders(ctx);
    db = ctx.db
    myRef = db.collection('returnPolicy')
    let query = await myRef.doc(shop).get()
    ctx.body = {'res': query._fieldsProto.special, 'default':query._fieldsProto.default}
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
