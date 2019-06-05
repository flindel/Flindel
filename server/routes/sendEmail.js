const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/send'
});

router.post('/', async ctx=>{
    headers['Accept'] = 'application/json'
    headers['Content-Type'] = 'application/json'
    headers['Authorization'] = 'Bearer' + process.env.SENDGRID
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
                    "email": "booleafs17@yahoo.ca",
                  }
                ],
                "subject": "EMAIL TEST"
              }
            ],
            "from": {
                "name": "Auto-Confirmation",
              "email": "no-reply@sender.com"
            },
            "content": [
              {
                "type": "text/plain",
                "value": "This is an automated email."
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
});

module.exports = router;