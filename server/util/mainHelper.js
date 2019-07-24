emailHelper = require('./emailHelper')

async function getItems(dbIn){
    let itemList = []
    db = dbIn
    myRef = db.collection('pending')
    let query = await myRef.get()
    await query.forEach(async doc => {
        let items = doc._fieldsProto.items.arrayValue.values
        for (var i = 0;i<items.length;i++){
            let tempItem = items[i].mapValue.fields
            tempItem.store = doc._fieldsProto.shop.stringValue
            tempItem.order = doc._fieldsProto.order.stringValue
            itemList.push(tempItem)
        }
    });
    return itemList
}

async function breakdown(items, dbIn){
    let acceptedList = []
    let refundList = []
    let returningList = []
    for (var i = 0; i<items.length;i++){
        let tempItem = {
            name: items[i].name.stringValue,
            variantid: items[i].variantid.stringValue,
            price: items[i].price.stringValue,
            status: items[i].status.stringValue,
            quantity: 1,
            store: items[i].store
        //item is created twice as a deep-copy substitute. it doesn't work without this
        }
        let tempItem2 = {
            name: items[i].name.stringValue,
            variantid: items[i].variantid.stringValue,
            store: items[i].store,
            order: items[i].order,
            quantity: 1
        }
        if (tempItem.status == 'accepted'){
            acceptedList.push(tempItem)
            refundList.push(tempItem2)
        }
        else if(tempItem.status == 'returning'){
            refundList.push(tempItem2)
            returningList.push(tempItem2)
        }
    }
    return {acceptedList, refundList, returningList}
}

async function combine(items){
    for (var i = 0;i<items.length;i++){
        for (var j = i+1;j<items.length;j++){
            if (items[i].variantid == items[j].variantid && items[i].store == items[j].store){
                items[i].quantity++
                items.splice(j,1)
                j--
            }
        }
    }
    return items;
}

async function sortRefund(items){
    let currList = []
    let storeItems = []
        while (items.length>0){
            //this part gets all the items in one store together, puts them in currList
            currList = []
            storeItems = []
            let currStore = items[0].store
            for (var i = 0;i<items.length;i++){
                if(items[i].store == currStore){
                    currList.push(items[i])
                    items.splice(i,1)
                    i--
                }
            }
            let currItemsList = []
            //at this point, all the items are one store, we do the same thing to group by order to help brand
            while (currList.length>0){
                currItemsList = []
                let currNum = currList[0].order
                for (var i = 0;i<currList.length;i++){
                    if(currList[i].order == currNum){
                        currItemsList.push(currList[i])
                        currList.splice(i,1)
                        i--
                    }
                }
                //once an order is taken care of, add it to the list
                let currOrder = {
                    orderNum : currNum,
                    refundItems : currItemsList
                }
                storeItems.push(currOrder)
            }
            //send the email to the store about who to refund
            sendRefundEmail(storeItems, currStore ,db)
        }
}

async function sortNewItems(items, dbIn){
    while (items.length>0){
        let currList = []
        let storeItems = []
        let currStore = items[0].store
        for (var i = 0;i<items.length;i++){
            if(items[i].store == currStore){
                currList.push(items[i])
                items.splice(i,1)
                i--
            }
        }
    sendItemEmail(items, currStore, dbIn)
    }
}

//send email to brand about items that are going to be put up for resale
async function sendItemEmail(listIn, store, db) {
    let email = emailHelper.getEmail(db, store)
    //emailHelper.sendItemEmail(listIn, email)
}

//send email to brand about which customers/orders need to be refunded because we accepted the item
async function sendRefundEmail(listIn, store, db){
    let email = emailHelper.getEmail(db, store)
    //emailHelper.sendRefundEmail(listIn, email)
}

module.exports = {getItems, breakdown, combine, sortRefund, sortNewItems}