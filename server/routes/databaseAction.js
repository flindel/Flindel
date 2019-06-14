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
    //write
    if(method == 1){
        db = ctx.db
        let data = {
            code: '122099',
            email: 'tombrady@email.com',
          };
          setDoc = db.collection('orders').doc('DUMMY_DATA2').set(data)
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
            ctx.body = { "unique":false}
        }
    }
        
})
module.exports = router;