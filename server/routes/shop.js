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

router.get('/initialization', async ctx => {
    const shop = ctx.query.shop
    console.log(shop)
    ctx.cookies.set('shop_id',shop)
    ctx.redirect(`https://${ctx.headers.host}`)
    ctx.body = {'initilization': shop}
})

//get shop domain
router.get('/domain', async ctx =>{
  const { cookies } = ctx;
  const shop = cookies.get('shop_id');
  const accessToken = cookies.get('accessToken');
  const option = {
      method: 'GET',
      url: `https://${shop}/${api_link}/shop.json`,
      headers: {
        'X-Shopify-Access-Token': accessToken
      },
      json: true,
  }
  try {
      let res = await rp(option);
      ctx.body = {'domain':res.shop.domain}
      console.log("get shop domain body..."+JSON.stringify(ctx.body));
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
})

router.get('/returnPolicy', async ctx =>{
    console.log(ctx)
    const { shop, accessToken } = getShopHeaders(ctx);
    db = ctx.db
    myRef = db.collection('store')
    let query = await myRef.doc(shop).get()
    ctx.body = {'res': query._fieldsProto.returnPolicy, 'default':query._fieldsProto.defaultReturn}
})

router.post("/onboardingStep", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  const { shop } = getShopHeaders(ctx);
  let body = JSON.parse(ctx.query.body);
  db = ctx.db;
  let docRef = db.collection("store").doc(shop);
  docRef.set(body, { merge: true });
  ctx.body = "success";
});

router.get('/onboardingStep', async ctx => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  db = ctx.db
  const { shop } = getShopHeaders(ctx);
  let myRef = db.collection('store').doc(shop);
  getDoc = await myRef.get()
  ctx.body = getDoc;

})


module.exports = router;
