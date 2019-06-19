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
    const code = ctx.query.code
    const email = ctx.query.email
    //write
    if(method == 1){
        db = ctx.db
        const rawItems = ctx.query.items
        let itemsJSON = JSON.parse(rawItems)
        let data = {
            code: code,
            email: email,
            financial_status: 'submitted',
            items: []
        };
        for (var i = 0;i<itemsJSON.length;i++){
            data.items.push({"name":itemsJSON[i].name, "reason":itemsJSON[i].reason, "var_id":itemsJSON[i].variantid,"status":"submitted"})
        }
        
          setDoc = db.collection('returns').doc().set(data)
          ctx.body = 'success'
    }
    //read single doc
    else if (method == 2){
        db = ctx.db
        myRef = db.collection('orders').doc('DUMMY_DATA');
        getDoc = await myRef.get()
        ctx.body = getDoc
    }
    //read all documents to see if code is unique (UID check)
    else if (method == 3){
        db = ctx.db

        myRef = db.collection('orders')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "unique":true}
        }
        else{
            ctx.body = { "unique":false}
        }
    }
})
module.exports = router;