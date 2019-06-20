const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/dbcall'
});

router.get('/' , async ctx =>{
  const method = ctx.query.method
  const testCode = ctx.query.code
  const body = JSON.parse(ctx.query.body);

  //write
  if(method == 1){
      db = ctx.db
      setDoc = db.collection('orders').doc('DUMMY_DATA2').set(body);
      ctx.body = 'success'
  }
  //read single doc
  else if (method == 2){
      db = ctx.db
      myRef = db.collection('orders').doc('DUMMY_DATA');
      getDoc = await myRef.get()
      console.log(getDoc)
      ctx.body = getDoc
  }
  else if (method == 3){
      db = ctx.db
      myRef = db.collection('orders')
      let query = await myRef.where('code','==',testCode).get()
      if (query.empty){
          console.log('no matching')
          ctx.body = { "unique":true}
      }
      else{
          console.log('yes matching')
          ctx.body = {"unique":false}
      }
  }
})

router.post('/product/', async ctx =>{
  let body = JSON.parse(ctx.query.body);
  db = ctx.db
  console.log(body);
  setDoc = db.collection('products').doc(body.git_id).set(body);
  ctx.body = 'success'
})

router.get('/product/', async ctx => {
  let gitID = ctx.query.gitID;
  db = ctx.db
  myRef = db.collection('products').doc(gitID);
  getDoc = await myRef.get()
  console.log(getDoc)
  ctx.body = getDoc;
})

module.exports = router;
