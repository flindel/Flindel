"use strict";
const Router = require("koa-router");
const router = Router();

router.get("/", async (ctx, next) => {
  console.log("at root................");
  await next();
});

module.exports = router;
