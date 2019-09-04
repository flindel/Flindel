const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");
const orderRouter = require("./orders");
const collectionRouter = require("./collections");
const productRouter = require("./products");
const geoCodingRouter = require("./geocoding");
const shopRouter = require("./shop");
const scriptTag = require("./scriptTag");
const sendRouter = require("./sendEmail");
const blacklistRouter = require("./blacklistFunctions");
const returnRouter = require("./existingReturn");
const productsFirestoreRouter = require("./productsFirestore");
const fulfservRouter = require("./fulserv");
const sendEmailRouter = require("./sendEmail");
const dbRouter = require("./databaseAction");
const webhookRouter = require("./webhooks");
const itemRouter = require("./item");
const fulfillmentRouter = require("./fulfillment");
const workerRouter = require("./worker");
const revertRouter = require("./revert");

router = combineRouters(
  rootRouter,
  orderRouter,
  collectionRouter,
  productRouter,
  geoCodingRouter,
  shopRouter,
  scriptTag,
  sendRouter,
  blacklistRouter,
  returnRouter,
  productsFirestoreRouter,
  fulfservRouter,
  sendEmailRouter,
  dbRouter,
  webhookRouter,
  itemRouter,
  fulfillmentRouter,
  workerRouter,
  revertRouter
);

module.exports = router;
