const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/dbcall'
});

router.get('/' , async ctx =>{
    const { shop, accessToken } = getShopHeaders(ctx);
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
        const orderNum = ctx.query.orderNum
        let date = ctx.query.date
        if (loco == 'pending'){
            date = ''
        }
        let itemsJSON = await JSON.parse(rawItems)
        let data = {
            date:date,
            code: code,
            email: email,
            shop: shop,
            order: orderNum,
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
            data.items.push({"name":itemsJSON[i].name, "price":itemsJSON[i].price, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status": myStatus})
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
        doc = await db.collection('returns').doc(code).get()
        data = {
            code: doc._fieldsProto.code.stringValue,
            email: doc._fieldsProto.email.stringValue,
            shop: doc._fieldsProto.shop.stringValue,
            items: [],
            order_status: 'complete',
            order: doc._fieldsProto.order.stringValue,
            date:doc._fieldsProto.date.stringValue,
        }
        for (var i = 0;i<doc._fieldsProto.items.arrayValue.values.length;i++){
            let temp = doc._fieldsProto.items.arrayValue.values[i]
            tempItem = {
                price: temp.mapValue.fields.price.stringValue,
                name: temp.mapValue.fields.name.stringValue,
                variantid: temp.mapValue.fields.variantid.stringValue,
                reason: temp.mapValue.fields.reason.stringValue,
                status: temp.mapValue.fields.status.stringValue
            }
        }
        data.items.push(tempItem)
        let set = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('returns').doc(code).delete();
        ctx.body = {"success":true}
    }
    //changing return order_status from "submitted" to "replaced" if customer restart an exsiting order
    else if (method == 8){
        db = ctx.db

        myRef = db.collection('returns').doc(code)
        let query = await myRef.update({
            order_status: 'replaced'
        })
        ctx.body = {'success':true}

    }
})

router.get('/report' , async ctx =>{
    let EMS = []
    db = ctx.db
    myRef = db.collection('pending')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let items = doc._fieldsProto.items.arrayValue.values
        for (var i = 0;i<items.length;i++){
            let tempItem = items[i].mapValue.fields
            tempItem.store = doc._fieldsProto.shop.stringValue
            EMS.push(tempItem)
        }
    });
    ctx.body = {'res': EMS}
})

router.get('/copy' , async ctx =>{
    db = ctx.db
    pending = db.collection('pending')
    let query = await pending.get()
    query.forEach(async doc =>{
        data = {
            code: doc._fieldsProto.code.stringValue,
            email: doc._fieldsProto.email.stringValue,
            shop: doc._fieldsProto.shop.stringValue,
            items: [],
            order_status: 'complete',
            order: order,
            date:date
        }
        for (var i = 0;i<doc._fieldsProto.items.arrayValue.values.length;i++){
            let temp = doc._fieldsProto.items.arrayValue.values[i]
            tempItem = {
                price: temp.mapValue.fields.price.stringValue,
                name: temp.mapValue.fields.name.stringValue,
                variantid: temp.mapValue.fields.variantid.stringValue,
                reason: temp.mapValue.fields.reason.stringValue,
                status: temp.mapValue.fields.status.stringValue
            }
        }
        data.items.push(tempItem)
        let set = db.collection('history').doc().set(data)
    })

    let myRef2 = db.collection('pending').listDocuments().then(val => {
        val.map((val) => {
            val.delete()
        })
    })
      
})

router.get('/expired', async ctx =>{
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    db = ctx.db
    myRef = db.collection('returns')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let orderDate = doc._fieldsProto.date.stringValue
        const date2 = new Date(orderDate)
        const date1 = new Date(currentDate)
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays >= 7){
            data = {
                code: doc._fieldsProto.code.stringValue,
                email: doc._fieldsProto.email.stringValue,
                shop: doc._fieldsProto.shop.stringValue,
                items: [],
                order_status: 'expired',
                order: doc._fieldsProto.order.stringValue,
                date:doc._fieldsProto.date.stringValue,
            }
            for (var i = 0;i<doc._fieldsProto.items.arrayValue.values.length;i++){
                let temp = doc._fieldsProto.items.arrayValue.values[i]
                tempItem = {
                    price: temp.mapValue.fields.price.stringValue,
                    name: temp.mapValue.fields.name.stringValue,
                    variantid: temp.mapValue.fields.variantid.stringValue,
                    reason: temp.mapValue.fields.reason.stringValue,
                    status: temp.mapValue.fields.status.stringValue
                }
            }
            data.items.push(tempItem)
            let set = db.collection('history').doc().set(data)
            doc.ref.delete()
        }
    });
    ctx.body = {'res': 'hi'}
})

router.get('/clear' , async ctx =>{
    db = ctx.db
    let myRef = db.collection('pending').listDocuments().then(val => {
        val.map((val) => {
            val.delete()
        })
    })    
})
router.get('/checkblacklist' , async ctx =>{
    db = ctx.db
    id = ctx.query.id
    myRef = db.collection('blacklist')
    let query = await myRef.where('variantid','==',id).get()
    if (query.empty){
        ctx.body = { "blacklist":false}
    }
    else{
        ctx.body = { "blacklist":true}
    }   
})

router.get('/additem' , async ctx =>{
    const item = ctx.query.item
    const status = ctx.query.status
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    db = ctx.db
    let itemJSON = await JSON.parse(item)
        let data = {
            name: itemJSON.name,
            variantid: itemJSON.variantid,
            store: itemJSON.store,
            status: status,
            date:currentDate,

        };
        for (var i = 0;i<itemJSON.quantity;i++){
            setDoc = db.collection('items').doc().set(data)
        }
          
        ctx.body = 'success'

})
router.get('/getToken' , async ctx =>{
    db = ctx.db
    storename = ctx.query.name
    myRef = db.collection('shop_tokens').doc(storename);
    getDoc = await myRef.get()
    ctx.body = {"token" : getDoc._fieldsProto.token.stringValue}  
})



module.exports = router;