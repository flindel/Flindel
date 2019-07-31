const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');
const expired = require('./expiredHelper')

//mark item as sold (webhook)
async function sellReturnItem(db, varId, store){
    myRef = db.collection('items')
    let found = false
    let tempDate = ('1/1/2100')
    let tempRef = ''
    let query = await myRef.where('status','==','reselling').where('store','==',store).where('variantidGIT','==',varId.toString()).get()
    //let query = await myRef.where('status','==','reselling').get()
    await query.forEach(async doc=>{
        let itemDate = doc._fieldsProto.dateProcessed.stringValue
        let difference = expired.getDateDifference(tempDate, itemDate)
        if (difference < 0){
            found = true
            tempDate = itemDate
            tempRef = doc.id
        }
    })
    if (found){
        let docToUpdate = myRef.doc(tempRef)
        let updateFields = docToUpdate.update({status:'sold', dateSold: expired.getCurrentDate()})
    }
}

//mark item as delivered
async function completeReturnItem(db, varId, store){
    //UPDATE FLINDEL STATUS
    myRef = db.collection('items')
    let found = false
    let query = await myRef.where('status','==','sold').where('store','==',store).where('variantidGIT','==',varId.toString()).get()
    await query.forEach(async doc=>{
        if (!found){
            let docToUpdate = myRef.doc(doc.id)
            let updateFields = docToUpdate.update({status:'fulfilled'})
            found = true
        }
    })
   /* //UPDATE SHOPIFY STATUS
    const option = {
        method: "POST",
        url: `https://${shop}/${api_link}/orders/${order_id}/fulfillments/${fulfillment_id}/complete.json`,
        headers: {
            'X-Shopify-Access-Token': accessToken
        },
        json: true
    };

    ctx.body = await rp(option);*/
} 

module.exports = {sellReturnItem, completeReturnItem}