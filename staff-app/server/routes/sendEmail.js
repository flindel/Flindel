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

//update from service center
router.post("/update", async ctx => {
  const email = ctx.query.email;
  let acceptedList = await JSON.parse(ctx.query.acceptList);
  let rejectedList = await JSON.parse(ctx.query.rejectList);
  let message = "";
  message +=
    "Thank you for submitting your return. Your order has been processed. ";
  if (acceptedList.length > 0) {
    message += "The following items have been accepted:";
    message += "\n\n";
    for (var i = 0; i < acceptedList.length; i++) {
      message +=
        i + 1 + ": " + acceptedList[i].name + " - " + acceptedList[i].variantid;
      message += "\n\n";
    }
  }
  if (rejectedList.length > 0) {
    message +=
      "The following items have been rejected. You may pick them up from X within the next 7 days. ";
    message += "\n\n";
    for (var i = 0; i < rejectedList.length; i++) {
      message +=
        i + 1 + ": " + rejectedList[i].name + " - " + rejectedList[i].variantid;
      message += "\n\n";
    }
  }
  message += "\n";
  message += "Thank you.";
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
              email: "booleafs17@yahoo.ca" //change to EMAIL once live
            }
          ],
          subject: "Status Update"
        }
      ],
      from: {
        name: "Status Update",
        email: "no-reply@sender.com"
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
//email sent to brand to inform of invalid GIT location being sold and refunding required
router.post("/brand", async ctx => {
  const parsedJSON = await JSON.parse(ctx.query.package);
  const db = ctx.db;
  const store = ctx.query.store;
  const email = await emailHelper.getStoreEmail(db, store);
  let emailString =
    parsedJSON[0].title +
    " ID:" +
    parsedJSON[0].id +
    " QUANTITY:" +
    parsedJSON[0].quantity +
    "\n\n";
  for (let i = 1; i < Object.keys(parsedJSON).length; i++) {
    emailString =
      emailString +
      parsedJSON[i].title +
      " ID:" +
      parsedJSON[i].id +
      " QUANTITY:" +
      parsedJSON[i].quantity +
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
          subject:
            "GIT ITEM INCORRECTLY SOLD REFUND REQUIRED FOR ORDER#" +
            ctx.query.orderid
        }
      ],
      from: {
        name: "Auto-Confirmation",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: emailString
        }
      ]
    }
  };
  try {
    ctx.body = await rp(option);
  } catch (err) {
    console.log("THIS ", err.message);
    if (err instanceof errors.StatusCodeError) {
      ctx.status = err.statusCode;
      ctx.message = err.message;
    } else if (err instanceof errors.RequestError) {
      ctx.status = 500;
      ctx.message = err.message;
    }
  }
});
//email to warehouse of what items to fulfill
router.post("/warehouse", async ctx => {
  const package = ctx.query.package;
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
              email: "someEmail@gmail.com"
            }
          ],
          subject: "GIT ITEMS"
        }
      ],
      from: {
        name: "Auto-Confirmation",
        email: "no-reply@sender.com"
      },
      content: [
        {
          type: "text/plain",
          value: package
        }
      ]
    }
  };
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
