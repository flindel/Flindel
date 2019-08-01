const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");
const orderRouter = require("./orders");
const fulfservRouter = require("./fulserv");
const sendEmailRouter = require("./sendEmail");
const dbRouter = require("./databaseAction");
const webhookRouter = require("./webhooks");

router = combineRouters(
  rootRouter,
  orderRouter,
  fulfservRouter,
  sendEmailRouter,
  dbRouter,
  webhookRouter
);

module.exports = router;
