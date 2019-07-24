const inv = require ('./editInventory')
const rp = require('request-promise');

async function clearExpiredOrders(dbIn){
    db = dbIn
    //batch for efficiency
    let batch = db.batch()
    let currentDate = getCurrentDate()
    myRef = db.collection('requestedReturns')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let orderDate = doc._fieldsProto.createdDate.stringValue
        diffDays = getDateDifference(currentDate, orderDate)
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
}

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
            let varID = doc._fieldsProto.variantid.stringValue
            //decrement inventory
            inv.editInventory(-1, store, varID, '', db)
        }
    });
    //commit batch
    batch.commit()
}

function getCurrentDate(){
    let currentDate = ''
    currentDate += (new Date().getMonth()+1)+'/'+ new Date().getDate() + '/'+  new Date().getFullYear()
    return currentDate
}

function getDateDifference(d1,d2){
    const date2 = new Date(d2)
    const date1 = new Date(d1)
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
}

module.exports = {clearExpiredItems, clearExpiredOrders, getCurrentDate}