"use strict";
const combineRouters = require("koa-combine-routers");
const rootRouter = require("./root");
const orderRouter = require("./orders");
const productRouter = require("./products");
const shopRouter = require("./shop");
const sendRouter = require("./sendEmail");
const returnRouter = require("./existingReturn");
const sendEmailRouter = require("./sendEmail");

const router = combineRouters(
  rootRouter,
  orderRouter,
  productRouter,
  shopRouter,
  sendRouter,
  returnRouter,
  sendEmailRouter
);

module.exports = router;
