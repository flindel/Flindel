const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/dbcallGit'
});

router.post('/product/git/', async ctx =>{
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

  let body = JSON.parse(ctx.query.body);
  console.log("POST BODY:", body);
  console.log("gitid: ", body.git_id);
  db = ctx.db
  setDoc = db.collection('products').doc(body.git_id+"").set(body);
  ctx.body = 'success'
})

router.post('/shop_tokens/install_time/', async ctx =>{
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  let body = JSON.parse(ctx.query.body);
  console.log("POST Install Time:", body);
  let db = ctx.db
  let setDoc = db.collection('shop_tokens').doc(body.shop_id+"").set(
    {
      install_time: body.install_time
    }, {merge:true});
  ctx.body = 'success'
})

router.get('/shop_tokens/', async ctx => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  const shop_id = ctx.query.shop_id;
  db = ctx.db
  let myRef = db.collection('shop_token').doc(shop_id);
  getDoc = await myRef.get()
  ctx.body = getDoc;
})

router.get('/product/git/', async ctx => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

  let gitID = ctx.query.gitID;
  db = ctx.db
  let myRef = db.collection('products').doc(gitID);
  getDoc = await myRef.get()
  ctx.body = getDoc;
})

router.get('/product/orig/', async ctx => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

  let origID = ctx.query.origID;
  db = ctx.db
  myRef = db.collection('products')
  let query = await myRef.where('orig_id','==',origID).get()
  if (query.empty){
    ctx.body = {}
  }
  else{
    await query.forEach(doc => {
      ctx.body = doc
    })
  }
})



router.delete('/product/git/', async ctx => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');

  let gitID = ctx.query.gitID;
  db = ctx.db
  myRef = db.collection('products').doc(gitID).delete();
  ctx.body = 'success';
})

router.get('/getBlacklist', async ctx => {
    db = ctx.db
    let store = ctx.query.store
    console.log("STORE: ", store);
    let products = []
    myRef = db.collection('blacklist')
    let query = await myRef.where('store','==',store).get()
    await query.forEach(async doc =>{
        products.push(doc._fieldsProto.productid.stringValue)
    })
    ctx.body = {'res':products}
})
router.get('/deleteBlacklist', async ctx => {
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
router.get('/addBlacklist', async ctx => {
    db = ctx.db
    store = ctx.query.store
    id = ctx.query.id
    data = {
        store:store,
        productid: id
    }
    let setDoc = db.collection('blacklist').doc().set(data)
    ctx.body = {'success':true}
})
module.exports = router;
