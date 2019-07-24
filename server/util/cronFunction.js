const serveoname = '04071318.serveo.net'
const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');
//LIVE controls whether things actually happen i.e. sending emails, updating DB, updating inventory
const live = 0

//send email to brand about items that are going to be put up for resale
async function sendEmail(listIn) {
    let LI = await JSON.stringify(listIn)
        fetch(`https://${serveoname}/send/itemReport?list=${encodeURIComponent(LI)}`,
        {
            method: 'POST',
        })
}

//send email to brand about which customers/orders need to be refunded because we accepted the item
async function sendStoreEmail(store, listIn){
    let temp = await fetch(`https://${serveoname}/shop/email?store=${encodeURIComponent(store)}`, {
            method: 'get',
        })
    t2 = await temp.json()
    let emailAdd = t2.email //email address for brand

    let LI = await JSON.stringify(listIn)
    fetch(`https://${serveoname}/send/refundReport?list=${encodeURIComponent(LI)}&email=${encodeURIComponent(emailAdd)}`,
    {
        method: 'POST',
    })
}

//main function, gets handles the orders that are in pending
async function mainReport(){
    //pull all the items from pending
    let temp = await fetch(`https://${serveoname}/return/pending/report`, {
            method: 'get',
        })
        t2 = await temp.json()
        //accepted list is for items for potential resale (accepted)
        let acceptedList = []
        //refund list is for items that need to be refunded (accepted+reselling+returning)
        let refundList = []
        for (var i = 0;i<t2.res.length;i++){
            let tempItem = {
                name: t2.res[i].name.stringValue,
                variantid: t2.res[i].variantid.stringValue,
                price: t2.res[i].price.stringValue,
                status: t2.res[i].status.stringValue,
                quantity: 1,
                store: t2.res[i].store
            //item is created twice as a deep-copy substitute. it doesn't work without this
            }
            let tempItem2 = {
                name: t2.res[i].name.stringValue,
                variantid: t2.res[i].variantid.stringValue,
                store: t2.res[i].store,
                order: t2.res[i].order
            }
            //add to appropriate list
            if (tempItem.status == 'accepted'){
                acceptedList.push(tempItem)
                refundList.push(tempItem2)
            }
            //if marked returning (broken zipper, refund but no resale)
            else if(tempItem.status == 'returning'){
                //add to list
                refundList.push(tempItem2)
                let item = JSON.stringify(tempItem)
                //write into items
                if (live){
                    fetch(`https://${serveoname}/item/add?status=${encodeURIComponent('returning')}&item=${encodeURIComponent(item)}`, {
                        method: 'get',
                    })
                }

            }
        }
        //cancel duplicates to get accurate quantities
        for (var i = 0;i<acceptedList.length;i++){
            for (var j = i+1;j<acceptedList.length;j++){
                if (acceptedList[i].variantid == acceptedList[j].variantid && acceptedList[i].store == acceptedList[j].store){
                    acceptedList[i].quantity++
                    acceptedList.splice(j,1)
                    j--
                }
            }
        }
        //update the inventory for accepted items, send email
        if(live){
            updateInventory(acceptedList)
            //sendEmail(acceptedList)
        }

        //this part condenses the items into their specific orders, filters them by store, and then combines to send to brand
        let currList = []
        let storeItems = []
        while (refundList.length>0){
            //this part gets all the items in one store together, puts them in currList
            currList = []
            storeItems = []
            let currStore = refundList[0].store
            for (var i = 0;i<refundList.length;i++){
                if(refundList[i].store == currStore){
                    currList.push(refundList[i])
                    refundList.splice(i,1)
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
            if (live){
                //sendStoreEmail(currStore, storeItems)
            }
        }
}

//update inv for reselling items
async function updateInventory(items){
    for (var i = 0;i<items.length;i++){
        //get information for active item
        let idActive = items[i].variantid
        let storeActive = items[i].store
        //get access token for specific store
        let tokenresponse = await fetch(`https://${serveoname}/shop/token?name=${encodeURIComponent(storeActive)}`, {
            method: 'get',
        })
        let tokenJSON = await tokenresponse.json()
        let token = tokenJSON.token //THIS IS THE TOKEN
        let torontoLocation = tokenJSON.tLocation
        //get inventory id and product id of active item
        const option = {
        url: `https://${storeActive}/${api_link}/variants/${encodeURIComponent(idActive)}.json`,
        headers: {
            'X-Shopify-Access-Token': token
        },
        json: true,
        }
        let temp = await rp(option);
        const invId =  temp.variant.inventory_item_id //THIS IS INVENTORY ID
        const productId = temp.variant.product_id //THIS IS PRODUCT ID

        //check blacklist
        let t2 = await fetch(`https://${serveoname}/blacklist/check?store=${encodeURIComponent(storeActive)}&id=${encodeURIComponent(productId)}`, {
            method: 'get',
        })
        t2json = await t2.json()
        let blacklist = t2json.blacklist
        if (blacklist == true){
            //create item status returning
            let item = JSON.stringify(items[i])
            if (live){
                fetch(`https://${serveoname}/item/add?status=${encodeURIComponent('returning')}&item=${encodeURIComponent(item)}`, {
                method: 'get',
            })
            }
        }
        else{
            //create item status reselling
            if(live){
                let item = JSON.stringify(items[i])
                fetch(`https://${serveoname}/item/add?status=${encodeURIComponent('reselling')}&item=${encodeURIComponent(item)}`, {
                method: 'get',
            })
            }
            //add to shopify inv
            addInv(items[i].store, items[i].quantity, invId, torontoLocation)
        }
    }
}

//actually add the inventory
async function addInv(shopname, quantity, invId, location){
        //update inventory of active item
        const option2 = {
            method: 'POST',
            url: `https://${shopname}/${api_link}/inventory_levels/adjust.json`,
            headers: {
                'Authorization': process.env.SHOP_AUTH
                },
            json: true,
            body:{
                "location_id": location, ///////////////////////////////////////////////////WHATEVER TORONTO LOCATION IS
                "inventory_item_id": invId,
                "available_adjustment": quantity,
            }
            }
            //actually update
            await rp(option2)
}
//get rid of anything that's been in orders for over 7 days
async function checkExpired(){
    //returns over 7 days - mark expired
    fetch(`https://${serveoname}/return/requested/expired`, {
            method: 'get',
        })
    //items reselling for over 7 days - mark returning
    fetch(`https://${serveoname}/item/expired`, {
            method: 'get',
        })
}
//wipe pending, everything has been dealt with by this point
function clearPending(){
    fetch(`https://${serveoname}/return/pending/clear`, {
            method: 'get',
        })
}

//notify of all items marked returning so we know when to send shipments back
async function returningReport(){
    let temp = await fetch(`https://${serveoname}/item/returningReport`, {
        method: 'get',
    })
    t2 = await temp.json()
    let returningList = t2.res
    //get all items marked returning, put together for easier viewing
    for (var i = 0;i<returningList.length;i++){
        for (var j = i+1;j<returningList.length;j++){
            if (returningList[i].variantid == returningList[j].variantid && returningList[i].store == returningList[j].store){
                returningList[i].quantity++
                returningList.splice(j,1)
                j--
            }
        }
    }
    console.log(returningList)
}

module.exports = {mainReport, clearPending, checkExpired, returningReport}
