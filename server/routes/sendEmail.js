const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const router = Router({
  prefix: "/sendEmail"
});

router.post("/warehouse", async ctx => {
  console.log("sending email");
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SEND_GRID;
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

router.post("/brand", async ctx => {
  const headers = {};
  headers["Accept"] = "application/json";
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = "Bearer " + process.env.SEND_GRID;
  const parsedJSON = await JSON.parse(ctx.query.package);
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
              email: "cengizsirlan.cs@gmail.com"
            }
          ],
          subject: "GIT ITEM INCORRECTLY SOLD REFUND REQUIRED"
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
