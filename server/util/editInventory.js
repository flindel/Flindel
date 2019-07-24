const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');

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

async function getAccessToken(dbIn, store){
    db = dbIn
    myRefToken = db.collection('shop_tokens').doc(store);
    getToken = await myRefToken.get()
    let accessToken = getToken._fieldsProto.token.stringValue //access token stored here
    let torontoLocation = getToken._fieldsProto.torontoLocation.stringValue
    return {accessToken, torontoLocation}
}

async function gitID(){

}

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
    let productID = temp.variant.inventory_id
    return {invId, productID}
}

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

module.exports = {editInventory, getInvID, getAccessToken}