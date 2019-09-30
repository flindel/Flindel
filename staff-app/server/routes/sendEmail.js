"use strict";
const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const emailHelper = require("../util/emailHelper");
const expiredHelper = require("../util/expiredHelper");
const router = Router({
  prefix: "/send"
});
//these are universal
const headers = {};
headers["Accept"] = "application/json";
headers["Content-Type"] = "application/json";
headers["Authorization"] = "Bearer " + process.env.SENDGRID;

router.post("/returnShipment", async ctx => {
  const store = ctx.query.store;
  const itemString = ctx.query.items;
  const code = ctx.query.code;
  const items = await JSON.parse(itemString);
  const db = ctx.db;
  const date = await expiredHelper.getCurrentDate();
  const email = await emailHelper.getStoreEmail(db, store);
  let message = "";
  message +=
    "A return shipment has been filed on " +
    date +
    ", and will be delivered shortly." +
    "\n\n";
  message += "CODE :" + code + "\n\n";
  message += "This shipment includes items from " + store + "\n\n";
  message += "This shipment includes the following items: \n\n";
  for (var i = 0; i < items.length; i++) {
    message +=
      items[i].name +
      " ... " +
      items[i].variantid +
      "... Quantity: " +
      items[i].value +
      "\n\n";
  }
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
              email: email
            }
          ],
          bcc: [
            {
              email: "mike.mccolm28@gmail.com"
            }
          ],
          subject: "Incoming Return Shipment"
        }
      ],
      from: {
        name: "Flindel Warehouse",
        email: "flindel@flindel.com" //retailer@flindel.com
      },
      content: [
        {
          type: "text/plain",
          value: message
        }
      ]
    }
  };
  ctx.body = await rp(option);
});

module.exports = router;