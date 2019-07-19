const serveoname = 'optimo.serveo.net'
const rp = require('request-promise');
const { api_link } = require('../default-shopify-api.json');
const live = 0

async function sendEmail(listIn) {
    let LI = await JSON.stringify(listIn)
        fetch(`https://${serveoname}/send/report?list=${encodeURIComponent(LI)}`, 
        {
            method: 'POST',
        })
        //delete stuff here
}

async function mainReport(){
    let temp = await fetch(`https://${serveoname}/dbcall/report`, {
            method: 'get',
        })
        t2 = await temp.json()
        let acceptedList = []
        for (var i = 0;i<t2.res.length;i++){
            let tempItem = {
                name: t2.res[i].name.stringValue,
                variantid: t2.res[i].variantid.stringValue,
                price: t2.res[i].price.stringValue,
                status: t2.res[i].status.stringValue,
                quantity: 1,
                store: t2.res[i].store
            }
            if (tempItem.status == 'accepted'){
                acceptedList.push(tempItem)
            }
            else if(tempItem.status == 'returning'){
                let item = JSON.stringify(tempItem)
                if (live){
                    fetch(`https://${serveoname}/dbcall/additem?status=${encodeURIComponent('returning')}&item=${encodeURIComponent(item)}`, {
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
        updateInventory(acceptedList)
        if(live){
            sendEmail(acceptedList)
        }
}

async function updateInventory(items){
    for (var i = 0;i<items.length;i++){
        //get information for active item
        let idActive = items[i].variantid
        let storeActive = items[i].store
        //get access token for specific store
        let tokenresponse = await fetch(`https://${serveoname}/dbcall/getToken?name=${encodeURIComponent(storeActive)}`, {
            method: 'get',
        })
        let tokenJSON = await tokenresponse.json()
        const token = tokenJSON.token //THIS IS THE TOKEN
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
        let t2 = await fetch(`https://${serveoname}/dbcall/checkblacklist?store=${encodeURIComponent(storeActive)}&id=${encodeURIComponent(productId)}`, {
            method: 'get',
        })
        t2json = await t2.json()
        let blacklist = t2json.blacklist
        
        if (blacklist == true){
            console.log(productId + '.....BAD')
            //create item status returning
            let item = JSON.stringify(items[i])
            if (live){
                fetch(`https://${serveoname}/dbcall/additem?status=${encodeURIComponent('returning')}&item=${encodeURIComponent(item)}`, {
                method: 'get',
            })
            }
        }
        else{
            console.log(productId + '.....GOOD')
            //create item status reselling
            if(live){
                let item = JSON.stringify(items[i])
                fetch(`https://${serveoname}/dbcall/additem?status=${encodeURIComponent('reselling')}&item=${encodeURIComponent(item)}`, {
                method: 'get',
            })
            }
            //add to shopify inv
            addInv(items[i].store, items[i].quantity, invId)    
        }
    }    
}

async function addInv(shopname, quantity, invId){
        //update inventory of active item
        const option2 = {
            method: 'POST',
            url: `https://${shopname}/${api_link}/inventory_levels/adjust.json`,
            headers: {
                'Authorization': process.env.SHOP_AUTH
                },
            json: true,
            body:{
                "location_id": 16351690815, ///////////////////////////////////////////////////WHATEVER TORONTO LOCATION IS
                "inventory_item_id": invId,
                "available_adjustment": quantity,
            }
            }
            //actually update
            await rp(option2)


}

//get rid of anything that's been in orders for over 7 days
async function checkExpired(){
    fetch(`https://${serveoname}/dbcall/expired`, {
            method: 'get',
        })
}
//wipe pending, everything has been dealt with by this point
async function clearPending(){
    fetch(`https://${serveoname}/dbcall/clear`, {
            method: 'get',
        })
}

async function returningReport(){
    let temp = await fetch(`https://${serveoname}/dbcall/returnReport`, {
        method: 'get',
    })
    t2 = await temp.json()
    let returningList = t2.res
    for (var i = 0;i<returningList.length;i++){
        for (var j = i+1;j<returningList.length;j++){
            if (returningList[i].variantid == returningList[j].variantid && returningList[i].store == returningList[j].store){
                returningList[i].quantity++
                returningList.splice(j,1)
                j--
            }
        }
    }
    console.log(returningList)//THIS IS ALL THE ITEMS MARKED RETURNING THAT WE HAVE
}

module.exports = {mainReport, clearPending, checkExpired, returningReport}