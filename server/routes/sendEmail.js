const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
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
    const code = ctx.query.code
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

//this is the report sent to the brand about which items have been accepted and could be going out on the store
router.post('/itemReport', async ctx=>{
  let itemList = await JSON.parse(ctx.query.list)
  message = ""
  if (itemList.length>0){
    message += 'The following return items have been accepted in the last 12 hours, and are eligible for potential resale in the morning.'
    message +='\n\n'
    for (var i = 0;i<itemList.length;i++){
    message += (i+1) + ': '+ itemList[i].name + ' - ' + itemList[i].variantid + ' ... Quantity: ' + itemList[i].quantity
    message += '\n\n'
    }
  }
    const option = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers: headers,
      json: true,
      body: {
        "personalizations": [
          {
            "to": [
              {
                "email": 'booleafs17@yahoo.ca' //change to EMAIL once live
              }
            ],
            "subject": "Daily Report - Items Received"
          }
        ],
        "from": {
            "name": "Daily Report",
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
});

//this email goes to the brand to let them know which orders need to be removed
router.post('/refundReport', async ctx=>{
  let emailAdd = ctx.query.email
  let orderList = await JSON.parse(ctx.query.list)
  let message = ''
  if (orderList.length>0){
    message += 'The following orders have items that should be refunded.'
    message +='\n\n'
    for (var i = 0;i<orderList.length;i++){
    message += 'Order Number ' + orderList[i].orderNum + ': '
      for(var j = 0;j<orderList[i].refundItems.length;j++){
          message += '\n'
          message += '\t'
          message += orderList[i].refundItems[j].variantid + ' ... ' + orderList[i].refundItems[j].name 
      }
      message += '\n\n'
    }
  }
  const headers = {}
  headers['Accept'] = 'application/json';
  headers['Content-Type'] = 'application/json';
  headers['Authorization'] = 'Bearer ' + process.env.SENDGRID;
    const option = {
      method: 'POST',
      url: 'https://api.sendgrid.com/v3/mail/send',
      headers: headers,
      json: true,
      body: {
        "personalizations": [
          {
            "to": [
              {
                "email": emailAdd //change to EMAIL once live
              }
            ],
            "subject": "Daily Report - Refunds Necessary"
          }
        ],
        "from": {
            "name": "Daily Report",
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
   
});

module.exports = router;