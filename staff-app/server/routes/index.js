"use strict";
const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");
const productRouter = require("./products");
const shopRouter = require("./shop");
const sendRouter = require("./sendEmail");
const blacklistRouter = require("./blacklistFunctions");
const returnRouter = require("./existingReturn");
const productsFirestoreRouter = require("./productsFirestore");
//const sendEmailRouter = require("./sendEmail");
const itemRouter = require("./item");
const fulfillmentRouter = require("./fulfillment");
const workerRouter = require("./worker");
const revertRouter = require("./revert");

const router = combineRouters(
  rootRouter,
  productRouter,
  shopRouter,
  sendRouter,
  blacklistRouter,
  returnRouter,
  productsFirestoreRouter,
  itemRouter,
  fulfillmentRouter,
  workerRouter,
  revertRouter
);

module.exports = router;
