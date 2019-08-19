const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const itemList = require ('../util/mainHelper')
const expiredHelper = require ('../util/expiredHelper')
const router = Router({
    prefix: '/return'
});

router.get('/requested/uuid', async ctx => {
        db = ctx.db
        code = ctx.query.code
        myRef = db.collection('requestedReturns')
        let query = await myRef.where('code','==',code).get()
        if (query.empty){
            myRef2 = db.collection('pendingReturns')
            let query2 = await myRef2.where('code','==',code).get()
            if (query2.empty){
                ctx.body = { "unique":true}
            }
            else{
                ctx.body = { "unique":false}
            }
        }
        else{
            ctx.body = { "unique":false}
        }
});

router.get('/requested/exists', async ctx=>{
    order = ctx.query.orderNum
    customerEmail = ctx.query.emailAdd
    db = ctx.db
    myRef = db.collection('requestedReturns')
    ctx.body = {
            'code':'none',
            'exsit':false
        }
        let querySnapshot = await myRef.where('order','==',order).where('email','==',customerEmail).get()
        if (!querySnapshot.empty){
            //data.items is the origianl items Array in db, which may contain repeat items
            const data = querySnapshot.docs[0].data()
            //returnItems is the return array without repeated item
            let returnItems = [data.items[0]]
            returnItems[0].quantity = 1
            for(let i = 1; i<data.items.length; i++){
                if(data.items[i].variantid != returnItems[returnItems.length-1].variantid){
                    returnItems.push(data.items[i])
                    returnItems[returnItems.length-1].quantity = 1
                }else{
                    returnItems[returnItems.length-1].quantity++
                }
            }
            returnItems.forEach(e =>{
                e.productID = e.productid
            })
            ctx.body = {"exist":true, 'code':data.code, 'items':returnItems}
    }
})

router.put('/requested/itemStatus', async ctx=>{
        code = ctx.query.code
        rawItems = ctx.query.items
        db = ctx.db
        let itemsJSON = await JSON.parse(rawItems)
        myRef = db.collection('requestedReturns').doc(code)
        updateFields = myRef.update({items:itemsJSON})
        ctx.body = {"success":true}
})

router.put('/requested/receive', async ctx=>{
    db = ctx.db
    code = ctx.query.code
    worker = ctx.query.workerID
    time = await getTime()
    myRef = db.collection('requestedReturns').doc(code)
    updateFields = myRef.update({order_status:'received', received_by: worker, itemsDropped: time})
    ctx.body =  true
})

router.get('/requested/items', async ctx=>{
        code = ctx.query.code
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
})

router.put('/requested/orderStatus', async ctx=>{
    db = ctx.db
        code = ctx.query.code
        myRef = db.collection('requestedReturns').doc(code)
        let query = await myRef.update({
            order_status: 'cancelled'
        })
        let getDoc = await db.collection('requestedReturns').doc(code).get()
        let data = getDoc.data()
        let setDoc = db.collection('history').doc().set(data)
        let deleteDoc = db.collection('requestedReturns').doc(code).delete()

        ctx.body = {'success':true}
})

router.get('/pending/itemList', async ctx=>{
    let fullList = await itemList.getItems(ctx.db);
    ctx.body = fullList
})

router.post('/requested/new', async ctx=>{
        db = ctx.db
        const { shop, accessToken } = getShopHeaders(ctx);
        const rawItems = ctx.query.items
        const orderNum = ctx.query.orderNum
        const date = ctx.query.date
        const code = ctx.query.code
        const email = ctx.query.email
        const emailOriginal = ctx.query.emailOriginal
        let itemsJSON = await JSON.parse(rawItems)
        let data = {
            //base information
            code: code,
            email: email,
            emailOriginal: emailOriginal,
            shop: shop,
            order: orderNum,
            order_status: 'submitted',
            items: [],
            createdDate: date,
            received_by: '',
            processEnd:'',
            processBegin:'',
            itemsDropped:''
        };
        //all items start submitted
        const myStatus = 'submitted'
        for (var i = 0;i<itemsJSON.length;i++){
            let [originalID, gitID, originalVarID, gitVarID] = await itemList.getGITInformation(ctx.db, itemsJSON[i].variantid.toString(), itemsJSON[i].productID.toString())
            data.items.push({"name":itemsJSON[i].name,"flag":'0', "title":itemsJSON[i].title, "variantTitle":itemsJSON[i].variantTitle, "productid":originalID, "productidGIT":gitID, "reason":itemsJSON[i].reason, "variantid":originalVarID, "variantidGIT": gitVarID, "status": myStatus})
        }
        //write to requested returns
        setDoc = db.collection('requestedReturns').doc(code).set(data)
        ctx.body = 'success'
})

router.put('/requested/openTime', async ctx=>{
    code = ctx.query.code
    db = ctx.db
    myRef = db.collection('requestedReturns').doc(code)
    let currTime = await getTime()
    updateFields = myRef.update({processBegin:currTime})
    ctx.body = true
})

router.put('/requested/closeTime', async ctx=>{
    code = ctx.query.code
    db = ctx.db
    myRef = db.collection('requestedReturns').doc(code)
    let currTime = await getTime()
    updateFields = myRef.update({processEnd:currTime})
    ctx.body = true
})

router.put('/pending/items',async ctx=>{
    code = ctx.query.code
    items = await JSON.parse(ctx.query.items)
    db = ctx.db
    myRef = db.collection('pendingReturns')
    let query = await myRef.where('code','==',code).get()
    let dRef = ''
    await query.forEach(doc=>{
        dRef = doc.ref
    })
    updateItems = dRef.update({items:items})
    ctx.body = true
})

function getTime(){
    let now = new Date()
    let month = now.getMonth()+1
    let day = now.getDate()
    let year = now.getFullYear()
    let hour = now.getHours()
    let minute = now.getMinutes().toString()
    if (minute.length != 2){
        minute = '0' + minute
    }
    let second = now.getSeconds().toString()
    if (second.length !=2){
        second = '0' + second
    }
    currTime = month + '/' + day + '/' + year + '-' + hour + ':' + minute + ':' + second
    return currTime
}

router.post('/pending/new', async ctx=>{
    db = ctx.db
    const codeIn = ctx.query.code
    let myRef = db.collection('requestedReturns').doc(codeIn)
    let oldDoc = await myRef.get()
    let newDate = await expiredHelper.getCurrentDate()
    let data = {
        order_status: oldDoc._fieldsProto.order_status.stringValue,
        email: oldDoc._fieldsProto.email.stringValue,
        processEnd: oldDoc._fieldsProto.processEnd.stringValue,
        createdDate: oldDoc._fieldsProto.createdDate.stringValue,
        code: oldDoc._fieldsProto.code.stringValue,
        emailOriginal: oldDoc._fieldsProto.emailOriginal .stringValue,
        order : oldDoc._fieldsProto.order.stringValue,
        shop: oldDoc._fieldsProto.shop.stringValue,
        received_by: oldDoc._fieldsProto.received_by.stringValue,
        itemsDropped: oldDoc._fieldsProto.itemsDropped.stringValue,
        processBegin: oldDoc._fieldsProto.processBegin.stringValue,
        receivedDate: newDate,
        items:[]
    }
    for (var i = 0;i<oldDoc._fieldsProto.items.arrayValue.values.length;i++){
        let tempItem = {
            value: 0,
            flag: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.flag.stringValue,
            name: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.name.stringValue,
            productid: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.productid.stringValue,
            productidGIT: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.productidGIT.stringValue,
            reason: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.reason.stringValue,
            status: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.status.stringValue,
            store: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.store.stringValue,
            variantid: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.variantid.stringValue,
            variantidGIT: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.variantidGIT.stringValue,
            oldItem: {
                OLDname: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem.mapValue.fields.OLDname.stringValue,
                OLDvariantid: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem.mapValue.fields.OLDvariantid.stringValue,
                OLDproductid: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem.mapValue.fields.OLDproductid.stringValue,
                OLDvariantidGIT: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem.mapValue.fields.OLDvariantidGIT.stringValue,
                OLDproductidGIT: oldDoc._fieldsProto.items.arrayValue.values[i].mapValue.fields.oldItem.mapValue.fields.OLDproductidGIT.stringValue,
            }
        }
        data.items.push(tempItem)
    }
    let writeDoc = await db.collection('pendingReturns').doc(codeIn).set(data)
    let deleteDoc = db.collection('requestedReturns').doc(codeIn).delete();   
    ctx.body =  true
})


module.exports = router;
