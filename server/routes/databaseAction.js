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
    //write order to database. goes either to pending or requested returns based on query
    if(method == 1){
        db = ctx.db
        const rawItems = ctx.query.items
        const loco = ctx.query.location
        const orderNum = ctx.query.orderNum
        let date = ctx.query.date
        let itemsJSON = await JSON.parse(rawItems)
        let data = {
            //base information
            code: code,
            email: email,
            shop: shop,
            order: orderNum,
            order_status: 'submitted',
            items: []
        };
        if (loco == 'pending'){
            //change date format based on destination
            data.receivedDate = date
            data.createdDate = ctx.query.originalDate
        }
        else if (loco == 'requestedReturns'){
            //change date format based on destination
            data.createdDate = date
        }
        for (var i = 0;i<itemsJSON.length;i++){
            if (loco == 'pending'){
                //if going to pending, write item status with the sorting centre status (correct)
                var myStatus = itemsJSON[i].status
            }
            else if (loco == 'requestedReturns'){
                //all items start submitted
                var myStatus = 'submitted'
            }
            data.items.push({"name":itemsJSON[i].name, "price":itemsJSON[i].price, "reason":itemsJSON[i].reason, "variantid":itemsJSON[i].variantid.toString(),"status": myStatus})
        }
        //write to requested returns if that is input destination. name it after it's own code to help searching manually
        if(loco == 'requestedReturns'){
            setDoc = db.collection(loco).doc(code).set(data)
        }
        //if writing to pending, pull from requested returns and then write to pending
        else if (loco == 'pending'){
            data.order_status = 'pending'
            setDoc = db.collection(loco).doc().set(data)
            //delete
            let receiveDate = (new Date().getMonth()+1)+'/'+ (new Date().getDate()) + '/'+  new Date().getFullYear()
            let processDate = (new Date().getMonth()+1)+'/'+ (new Date().getDate()+1) + '/'+  new Date().getFullYear()
            doc = await db.collection('requestedReturns').doc(code).get()
            //copy basic information
            data = {
            code: doc._fieldsProto.code.stringValue,
            email: doc._fieldsProto.email.stringValue,
            shop: doc._fieldsProto.shop.stringValue,
            items: [],
            order_status: 'complete',
            order: doc._fieldsProto.order.stringValue,
            createdDate:doc._fieldsProto.createdDate.stringValue,
            receivedDate: receiveDate,
            processedDate : processDate,
        }
        //copy over items
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
        //actually write
        data.items.push(tempItem)
        //write to history if also writing to pending as it'll end up there anyways. delete from req returns
        let set = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('requestedReturns').doc(code).delete();
        }
          
          ctx.body = 'success'
    }
    //read single doc where we know the doc title
    else if (method == 2){
        db = ctx.db
        myRef = db.collection('requestedReturns').doc(code);
        getDoc = await myRef.get()
        ctx.body = {"res" : getDoc._fieldsProto.items}
    }
    //read all documents to see if code is unique (UID check)
    else if (method == 3){
        db = ctx.db

        myRef = db.collection('requestedReturns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            ctx.body = { "unique":true}
        }
        else{
            ctx.body = { "unique":false}
        }
    }
    
    //check to see if order exists already (review + replace check)
    else if (method ==4){
        
        db = ctx.db
        myRef = db.collection('requestedReturns')
        ctx.body = {
            'code':'none',
            'exsit':false
        }
        let querySnapshot = await myRef.where('order','==',order).where('email','==',customerEmail).get()
        if (!querySnapshot.empty){
            ctx.body = {"exist":true, 'code':querySnapshot.docs[0].id}
         }
    }
    //read all documents to see if the return exisited based on email and orderNum
    else if (method == 5){
        db = ctx.db
        myRef = db.collection('requestedReturns')
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
    //update item status in requested returns (from sorting center)
    else if (method == 6){
        db = ctx.db
        const rawItems = ctx.query.items
        let itemsJSON = await JSON.parse(rawItems)
        myRef = db.collection('requestedReturns').doc(code)
        updateFields = myRef.update({items:itemsJSON})
        ctx.body = {"success":true}
    }
    //changing return order_status from "submitted" to "replaced" if customer restart an exsiting order
    else if (method == 8){
        db = ctx.db

        myRef = db.collection('requestedReturns').doc(code)
        let query = await myRef.update({
            order_status: 'cancelled'
        })
        let getDoc = await db.collection('requestedReturns').doc(code).get()
        //console.log(getDoc.data())
        let data = getDoc.data()
        let setDoc = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('requestedReturns').doc(code).delete()

        ctx.body = {'success':true}

    }
})

//main report, gets all items in pending
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
            tempItem.order = doc._fieldsProto.order.stringValue
            EMS.push(tempItem)
        }
    });
    ctx.body = {'res': EMS}
})

//get email from store so we know who to send to
router.get('/getStoreEmail', async ctx =>{
    db = ctx.db
    store = ctx.query.store
    myRef = db.collection('shop_tokens').doc(store)
    let query = await myRef.get()
    ctx.body = {'email':query._fieldsProto.email.stringValue}
})

//check requestedReturns to see if anything is 7+ days old
router.get('/expiredReturns', async ctx =>{
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    db = ctx.db
    //batch for efficiency
    let batch = db.batch()
    myRef = db.collection('requestedReturns')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let orderDate = doc._fieldsProto.createdDate.stringValue
        const date2 = new Date(orderDate)
        const date1 = new Date(currentDate)
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        //if there's a 7 day difference, order is expired
        if (diffDays >= 7){
            //copy items over
            data = {
                code: doc._fieldsProto.code.stringValue,
                email: doc._fieldsProto.email.stringValue,
                shop: doc._fieldsProto.shop.stringValue,
                items: [],
                order_status: 'expired',
                order: doc._fieldsProto.order.stringValue,
                createdDate:doc._fieldsProto.createdDate.stringValue,
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
            //copy to history, mark expired, delete from req return to prevent cloggin
            data.items.push(tempItem)
            let set = db.collection('history').doc()
            batch.set(set,data)
            batch.delete(doc.ref)
        }
    });
    //commit
    batch.commit()
    ctx.body = {'res': 'done'}
})

//see if any items are 7+ days old and expired
router.get('/expiredItems', async ctx =>{
    db = ctx.db
    //batch for efficiency
    let batch = db.batch()
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    myRef = db.collection('items')
    let query = await myRef.where('status','==','reselling').get()
    if (!query.empty){
        
    }
    await query.forEach(async doc => {
        //calculate time difference between current and date of entry
        let orderDate = doc._fieldsProto.date.stringValue
        const date2 = new Date(orderDate)
        const date1 = new Date(currentDate)
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        //if item has been reselling for 7 days:
        if (diffDays >= 7){
            //mark item with status returning, write to batch
            batch.update(doc.ref, {status:'returning'})
            //get access token for that specific item
            myRefToken = db.collection('shop_tokens').doc(doc._fieldsProto.store.stringValue);
            getToken = await myRefToken.get()
            let accessToken = getToken._fieldsProto.token.stringValue //access token stored here
            let torontoLocation = getToken._fieldsProto.torontoLocation.stringValue
            //get inventory id for specific item
            let idActive = doc._fieldsProto.variantid.stringValue
            let option = {
                url: `https://${doc._fieldsProto.store.stringValue}/${api_link}/variants/${idActive}.json`,
                headers: {
                    'X-Shopify-Access-Token': accessToken
                },
                json: true,
                }
            let temp = await rp(option);
            let invId = temp.variant.inventory_item_id//inventory item stored here
            //Decrement shopify inventory accordingly
            let option2 = {
                method: 'POST',
                url: `https://${doc._fieldsProto.store.stringValue}/${api_link}/inventory_levels/adjust.json`,
                headers: {
                    'Authorization': process.env.SHOP_AUTH
                    },
                json: true,
                body:{
                    "location_id": torontoLocation,
                    "inventory_item_id": invId,
                    "available_adjustment": -1
                }
                }
                //actually update
                await rp(option2)
        }
    });
    //commit batch
    batch.commit()
    ctx.body = {'res': 'done'}
})

//wipe pending database. done at end of cron
router.get('/clear' , async ctx =>{
    db = ctx.db
    let batch = db.batch()
    let myRef = db.collection('pending')
    let query = await myRef.get()
    await query.forEach(async doc =>{
        batch.delete(doc.ref)
    })
    batch.commit();
})

//check to see if item's id is on the blacklist, return true or false
router.get('/checkblacklist' , async ctx =>{
    db = ctx.db
    id = ctx.query.id
    store = ctx.query.store
    myRef = db.collection('blacklist')
    let query = await myRef.where('productid','==',id).where('store','==',store).get()
    if (query.empty){
        ctx.body = { "blacklist":false}
    }
    else{
        ctx.body = { "blacklist":true}
    }   
})

//add item to ITEMS after it's processed
router.get('/additem' , async ctx =>{
    const item = ctx.query.item
    const status = ctx.query.status
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    db = ctx.db
    //efficiency
    let batch = db.batch()
    let itemJSON = await JSON.parse(item)
        let data = {
            name: itemJSON.name,
            variantid: itemJSON.variantid,
            store: itemJSON.store,
            status: status,
            dateProcessed:currentDate,

        };
        //copy over
        for (var i = 0;i<itemJSON.quantity;i++){
            setDoc = db.collection('items').doc()
            batch.set(setDoc,data)
        }
        //commit batch
        batch.commit()
        ctx.body = 'success'

})
//get access token for store
router.get('/getToken' , async ctx =>{
    db = ctx.db
    storename = ctx.query.name
    myRef = db.collection('shop_tokens').doc(storename);
    getDoc = await myRef.get()
    ctx.body = {"token" : getDoc._fieldsProto.token.stringValue, "tLocation":getDoc._fieldsProto.torontoLocation.stringValue}  
})
//get all items marked returning in ITEMS for returning items cron job
router.get('/returnReport' , async ctx =>{
    let EMS = []
    db = ctx.db
    myRef = db.collection('items')
    let query = await myRef.get()
    await query.forEach(async doc => {
        if (doc._fieldsProto.status.stringValue == 'returning'){
            tempItem= {
                variantid: doc._fieldsProto.variantid.stringValue,
                name : doc._fieldsProto.name.stringValue,
                store : doc._fieldsProto.store.stringValue,
                quantity: 1
            }
        }
        EMS.push(tempItem)
    });
    ctx.body = {'res': EMS}
})

//load blacklist for interface
router.get('/getBlacklist', async ctx => {
    db = ctx.db
    let store = ctx.query.store
    let products = []
    myRef = db.collection('blacklist')
    let query = await myRef.where('store','==',store).get()
    await query.forEach(async doc =>{
        products.push(doc._fieldsProto.productid.stringValue)
    })
    ctx.body = {'res':products}
})
//delete item from blacklist
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
//add item to blacklist
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
//load store's return policy to filter items
router.get('/returnPolicy', async ctx => {
    const { shop, accessToken } = getShopHeaders(ctx);
    db = ctx.db
    myRef = db.collection('returnPolicy').where('store','==',shop)
    query = await myRef.get()
    query.forEach(async doc =>{
        ctx.body = {'res': doc._fieldsProto.special, 'default':doc._fieldsProto.default}
    })
})



module.exports = router;