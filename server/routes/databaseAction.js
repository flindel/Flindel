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
            order_status: 'submitted',
            items: []
        };
        for (var i = 0;i<itemsJSON.length;i++){
            data.items.push({"name":itemsJSON[i].name, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status":"submitted"})
        }
        
          setDoc = db.collection('returns').doc(code).set(data)
          ctx.body = 'success'
    }
    //read single doc
    else if (method == 2){
        db = ctx.db
        myRef = db.collection('returns').doc(code);
        getDoc = await myRef.get()
        ctx.body = {"res" : getDoc._fieldsProto.items}
    }
    //read all documents to see if code is unique (UID check)
    else if (method == 3){
        db = ctx.db

        myRef = db.collection('returns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "unique":true}
        }
        else{
            ctx.body = { "unique":false}
        }
    }
    else if (method == 5){
        db = ctx.db
        myRef = db.collection('returns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "valid":false}
        }
        else{
            await query.forEach(doc => {
                ctx.body = {"res":doc._fieldsProto.items,"valid":true}
            })
        }
    }
    else if (method == 6){
        db = ctx.db
        const rawItems = ctx.query.items
        let itemsJSON = await JSON.parse(rawItems)
        myRef = db.collection('returns').doc(code)
        updateFields = myRef.update({items:itemsJSON})
        ctx.body = {"success":true}
    }


})
module.exports = router;