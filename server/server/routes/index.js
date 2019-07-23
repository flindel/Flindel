const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");

const fulserveRouter = require("./fulserv");

//const endpoint = require("./hookendpoint");

const sendEmailRouter = require("./sendEmail");

const cancelOrderRouter = require("./cancelOrder");

const dbcall = require("./databaseAction");

router = combineRouters(
  rootRouter,
  fulserveRouter,
  // endpoint
  sendEmailRouter,
  dbcall,
  cancelOrderRouter
);

module.exports = router;
