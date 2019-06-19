const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");

const fulserveRouter = require("./fulserv");

const recive = require("./recieve");

router = combineRouters(
  rootRouter,
  fulserveRouter
  //   recive,
);

module.exports = router;
