const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/dbcall'
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

module.exports = router;
