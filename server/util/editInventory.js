const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');
const expired = require('./expiredHelper')

//edit inventory in shopify
async function editInventory(change, store, varID, torontoLocation, dbIn){
    if (torontoLocation != ''){
        increment(change, torontoLocation, varID, store)
    }
    else{
        let {accessToken, torontoLocation} = await getAccessToken(dbIn, store)
        //get gitID here when we actually have duplicates
        let {invId, productID} = await getInvID(store, varID, accessToken)
        increment(change, torontoLocation, invId, store)
    }
}

//get access token and toronto location from databse (expand later)
async function getAccessToken(dbIn, store){
    db = dbIn
    myRefToken = db.collection('shop_tokens').doc(store);
    getToken = await myRefToken.get()
    let accessToken = getToken._fieldsProto.token.stringValue //access token stored here
    myRefLocation = db.collection('store').doc(store);
    getLocation = await myRefLocation.get()
    let torontoLocation = getLocation._fieldsProto.torontoLocation.stringValue
    return {accessToken, torontoLocation}
}

//when a full table is set up, this will find corresponding GIT ID to update that inventory. empty for now, waiting on structure
async function regularToGit(store, idIn, db){
    return gitId
}

async function gitToRegular(store, idIn, db){
    return varId
}

//remove from flindel inventory database. not used yet, triggered by webhook
async function sellReturnItem(varId, db, store){
    myRef = db.collection('items')
    let tempDate = ('12/31/9999')
    let tempRef = ''
    let query = await myRef.where('status','==','reselling').where('store','==',store).where('variantid','==',varId).get()
    await query.forEach(async doc=>{
        let itemDate = expired.getCurrentDate()
        let difference = expired.getDateDifference(tempDate, itemDate)
        if (difference < 0){
            tempDate = itemDate
            tempRef = doc.ref
        }
    })
    let deleteDoc = myRef.delete(tempRef)
}

//get inventory ID and product ID
async function getInvID(store, varID, accessToken){
    let option = {
        url: `https://${store}/${api_link}/variants/${varID}.json`,
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        json: true,
        }
    let temp = await rp(option);
    let invId = temp.variant.inventory_item_id
    let productId = temp.variant.product_id
    return {invId, productId}
}

//actually increment inventory
async function increment(quantity, torontoLocation, invId, store){
    let option2 = {
        method: 'POST',
        url: `https://${store}/${api_link}/inventory_levels/adjust.json`,
        headers: {
            'Authorization': process.env.SHOP_AUTH
            },
        json: true,
        body:{
            "location_id": torontoLocation,
            "inventory_item_id": invId,
            "available_adjustment": quantity
        }
        }
        //actually update
        await rp(option2)
}

module.exports = {editInventory, getInvID, getAccessToken, increment}