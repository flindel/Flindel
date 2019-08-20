const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const emailHelper = require('../util/emailHelper')
const expiredHelper = require('../util/expiredHelper')
const router = Router({
    prefix: '/send'
});
//these are universal
const headers = {}
headers['Accept'] = 'application/json';
headers['Content-Type'] = 'application/json';
headers['Authorization'] = 'Bearer ' + process.env.SENDGRID;

//update from service center
router.post('/update', async ctx=>{
    const email = ctx.query.email
    let acceptedList = await JSON.parse(ctx.query.acceptList)
    let rejectedList = await JSON.parse(ctx.query.rejectList)
      let message = ''
      message += 'Thank you for submitting your return. Your order has been processed. '
      if (acceptedList.length>0){
        message += 'The following items have been accepted:'
        message +='\n\n'
        for (var i = 0;i<acceptedList.length;i++){
        message += (i+1) + ': '+ acceptedList[i].name + ' - ' + acceptedList[i].variantid
        message += '\n\n'
        }
      }
      if (rejectedList.length>0){
        message += 'The following items have been rejected. You may pick them up from X within the next 7 days. '
        message += '\n\n'
        for (var i = 0;i<rejectedList.length;i++){
        message += (i+1) + ': ' + rejectedList[i].name + ' - ' + rejectedList[i].variantid
        message += '\n\n'
        }
      }
      message += '\n'
      message += 'Thank you.'
      const option = {
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: headers,
        json: true,
        body:{
            "personalizations": [
              {
                "to": [
                  {
                    "email": 'booleafs17@yahoo.ca' //change to EMAIL once live
                  }
                ],
                "subject": "Status Update"
              }
            ],
            "from": {
                "name": "Status Update",
              "email": "no-reply@sender.com"
            },
            "content": [
              {
                "type": "text/plain",
                "value": message
              }
            ]
          }
    }
        ctx.body = await rp(option);
  
})
//confirmation order after they complete return form
router.post('/confirmation', async ctx=>{
  const email = ctx.query.email
  const code = ctx.query.code
  const option = {
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: headers,
        json: true,
        body:{
            "personalizations": [
              {
                "to": [
                  {
                    "email": 'booleafs17@yahoo.ca' //change to EMAIL once live
                  }
                ],
                "subject": "Return Confirmation"
              }
            ],
            "from": {
                "name": "Auto-Confirmation",
              "email": "no-reply@sender.com" //retailer@flindel.com
            },
            "content": [
              {
                "type": "text/plain",
                "value": 'Thank you for submitting your return. Your confirmation code is: ' + code + ' . Further instructions here...'
              }
            ]
          }
    }
    ctx.body = await rp(option);    
});

//send emails to brand and flindel after a shipment gets processed
router.post('/returnShipment', async ctx=>{
  const store = ctx.query.store
  const itemString = ctx.query.items
  const items = await JSON.parse(itemString)
  const db = ctx.db
  const date = await expiredHelper.getCurrentDate()
  const email = await emailHelper.getStoreEmail(db,store)
  let message = ''
  message += 'A return shipment has been filed on ' + date + ', and will be delivered shortly.' + '\n\n'
  message += 'This shipment includes items from ' + store + '\n\n'
  message += 'This shipment includes the following items: \n\n'
  for (var i = 0;i<items.length;i++){
    message+= items[i].name + ' ... ' + items[i].variantid + '... Quantity: ' + items[i].value + '\n\n'
  }
  const option = {
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: headers,
        json: true,
        body:{
            "personalizations": [
              {
                "to": [
                  {
                    "email": email,
                  }
                ],
                "bcc":[
                  {
                    "email":'mike.mccolm28@gmail.com'
                  }
                ],
                "subject": "Incoming Return Shipment"
              }
            ],
            "from": {
                "name": "Flindel Warehouse",
              "email": "flindel@flindel.com" //retailer@flindel.com
            },
            "content": [
              {
                "type": "text/plain",
                "value": message
              }
            ]
          }
    }
    ctx.body = await rp(option);    
});

module.exports = router;
