"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/send"
});
//these are universal
const headers = {};
headers["Accept"] = "application/json";
headers["Content-Type"] = "application/json";
headers["Authorization"] = "Bearer " + process.env.SENDGRID;

//send to customer to confirm requested return
router.post("/confirmation", async ctx => {
  const email = ctx.query.email;
  const code = ctx.query.code;
  const option = {
    method: "POST",
    url: "https://api.sendgrid.com/v3/mail/send",
    headers: headers,
    json: true,
    body: {
      personalizations: [
        {
          to: [
            {
              email: email //change to EMAIL once live
            }
          ],
          bcc: [
            {
              email: "booleafs17@yahoo.ca"
            }
          ],
          subject: "Return Confirmation"
        }
      ],
      from: {
        name: "Auto-Confirmation",
        email: "no-reply@sender.com" //retailer@flindel.com
      },
      content: [
        {
          type: "text/plain",
          value:
            "Thank you for submitting your return. Your confirmation code is: " +
            code +
            " . Further instructions here..."
        }
      ]
    }
  };
  ctx.body = await rp(option);
});

module.exports = router;
