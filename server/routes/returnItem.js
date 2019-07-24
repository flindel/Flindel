const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/item'
});

router.get('/returningReport', async ctx => {
    let returningItems = []
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
        returningItems.push(tempItem)
    });
    ctx.body = {'res': returningItems}
});

router.post('/add', async ctx => {
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

});

router.put('/expired', async ctx => {
    db = ctx.db
    //batch for efficiency
    let batch = db.batch()
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    myRef = db.collection('items')
    let query = await myRef.where('status','==','reselling').get()
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


module.exports = router;
