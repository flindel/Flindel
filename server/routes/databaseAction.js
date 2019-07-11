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
    const order = ctx.query.orderNum
    const customerEmail = ctx.query.emailAdd
    //write
    if(method == 1){
        db = ctx.db
        const rawItems = ctx.query.items
        const loco = ctx.query.location
        let itemsJSON = JSON.parse(rawItems)
        let data = {
            code: code,
            email: email,
            order_status: 'submitted',
            items: []
        };
        for (var i = 0;i<itemsJSON.length;i++){
            if (loco == 'pending'){
                var myStatus = itemsJSON[i].status
            }
            else if (loco == 'returns'){
                var myStatus = 'submitted'
            }
            data.items.push({"name":itemsJSON[i].name, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status": myStatus})
        }
        if(loco == 'returns'){
            setDoc = db.collection(loco).doc(code).set(data)
        }
        else if (loco == 'pending'){
            data.order_status = 'pending'
            setDoc = db.collection(loco).doc().set(data)
        }
          
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
    //read all documents to see if the return exisited based on email and ordernum
    else if (method ==4){
        console.log(order)
        console.log(customerEmail)
        db = ctx.db
        myRef = db.collection('returns')
        let query = await myRef.get()
         ctx.body = {'code':'none',
                     'exist': false}
        await query.forEach(async doc=>{
            //console.log(doc._fieldsProto)
            if (doc._fieldsProto.order.stringValue == order && doc._fieldsProto.email.stringValue == customerEmail && doc._fieldsProto.order_status.stringValue == 'submitted'){
                ctx.body = {'code':doc._fieldsProto.code.stringValue,
                            'exsit':true}
            }
        })
        
        //check if exist by orderID and email
        // db = ctx.db
        // myRef = db.collection('returns')
        // let query = await myRef.where('order','==',order).where('email','==',customerEmail).get()
        // if (query.empty){
        //     ctx.body = {"exist":false}
        // }else {
        //     ctx.body = {"exist":true}
        //     console.log("query===="+JSON.stringify(query))
        // }
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
                ctx.body = {"res":doc._fieldsProto,"valid":true}
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
    else if (method == 7){
        db = ctx.db
        let deleteDoc = db.collection('returns').doc(code).delete();
        ctx.body = {"success":true}
    }
    //changing return order_status from "submitted" to "replaced" if customer restart an exsiting order
    else if (method == 8){
        db = ctx.db

        db.collection('returns').doc(code).set({
            order_status: 'replaced'
        }).then(()=>{
            ctx.body = {"sucess": true}
        }).catch((err)=>{
            console.err("Error changing return order_status: ", err)
        })
    }

})
module.exports = router;