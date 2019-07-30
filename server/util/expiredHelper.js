const inv = require ('./editInventory')
const rp = require('request-promise');

//clear orders from requestedReturns that have expired
async function clearExpiredOrders(dbIn){
    db = dbIn
    //batch for efficiency
    let batch = db.batch()
    let currentDate = getCurrentDate()
    myRef = db.collection('requestedReturns')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let orderDate = doc._fieldsProto.createdDate.stringValue
        //get time elapsed since return was requested
        diffDays = getDateDifference(currentDate, orderDate)
        //if there's a 7 day difference, return is expired
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
                    status: temp.mapValue.fields.status.stringValue,
                    productid: temp.mapValue.fields.productid.stringValue,
                    variantidGIT: temp.mapValue.fields.variantidGIT.stringValue,
                    productidGIT: temp.mapValue.fields.productidGIT.stringValue
                }
            }
            //copy to history, mark expired, delete from req return to prevent clogging
            data.items.push(tempItem)
            let set = db.collection('history').doc()
            batch.set(set,data)
            batch.delete(doc.ref)
        }
    });
    //commit
    batch.commit()
}

//pull items off reselling if they've been there for 7 days
async function clearExpiredItems(dbIn){
    db = dbIn
    //batch for efficiency
    let batch = db.batch()
    let currentDate = getCurrentDate()
    myRef = db.collection('items')
    let query = await myRef.where('status','==','reselling').get()
    await query.forEach(async doc => {
        //calculate time difference between current and date of entry
        let processedDate = doc._fieldsProto.dateProcessed.stringValue
        diffDays = getDateDifference(currentDate, processedDate)
        //if item has been reselling for 7 days:
        if (diffDays >= 7){
            //mark item with status returning, write to batch
            batch.update(doc.ref, {status:'returning'})
            let store = doc._fieldsProto.store.stringValue
            let varID = doc._fieldsProto.variantidGIT.stringValue
            //decrement inventory
            inv.editInventory(-1, store, varID, '', db)
        }
    });
    //commit batch
    batch.commit()
}

//returns current date (MM/DD/YYYY)
function getCurrentDate(){
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    return currentDate
}

//calculates and returns difference between two dates (time elapsed)
function getDateDifference(d1,d2){
    const date2 = new Date(d2)
    const date1 = new Date(d1)
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

module.exports = {clearExpiredItems, clearExpiredOrders, getCurrentDate, getDateDifference}