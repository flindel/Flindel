const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/send'
});

router.post('/', async ctx=>{
    const headers = {}
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    headers['Authorization'] = 'Bearer ' + process.env.SENDGRID;
    const email = ctx.query.email
    const code = ctx.query.code
    const method = ctx.query.method
    if(method == 3){
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
              "email": "no-reply@sender.com"
            },
            "content": [
              {
                "type": "text/plain",
                "value": 'Thank you for submitting your return. Your confirmation code is: ' + code + ' . Further instructions here...'
              }
            ]
          }
    }
    try {
        ctx.body = await rp(option);
    } catch (err) {
        console.log(err.message);
        if (err instanceof errors.StatusCodeError) {
            ctx.status = err.statusCode;
            ctx.message = err.message;
        } else if (err instanceof errors.RequestError) {
            ctx.status = 500;
            ctx.message = err.message;
        }
    }
    }
    else if (method == 2){
      var acceptedList = await JSON.parse(ctx.query.acceptList)
      var rejectedList = await JSON.parse(ctx.query.rejectList)
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
    try {
        ctx.body = await rp(option);
    } catch (err) {
        console.log(err.message);
        if (err instanceof errors.StatusCodeError) {
            ctx.status = err.statusCode;
            ctx.message = err.message;
        } else if (err instanceof errors.RequestError) {
            ctx.status = 500;
            ctx.message = err.message;
        }
    }
    }
     
});

module.exports = router;