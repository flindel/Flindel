"use strict";
require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const cors = require("@koa/cors");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const dotenv = require("dotenv");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
dotenv.config();
const { catchError, logError } = require("./error");
const { accessToken } = require("./util/acessTokenDB");
const cronUtil = require("./util/cronFunction");
const whTest = require("./util/webhookHelper"); //////////////////////
const cron = require("cron");
const { CronJob } = cron;
const proxy = require("koa-better-http-proxy");
/////////////
const rp = require("request-promise");
const errors = require("request-promise/errors");
/////////////


//new CronJob("* * */23 * * *", warehouseOrder, null, true);

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  dir: "./client"
});
const handle = app.getRequestHandler();

const router = require("./routes/index");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://flindel-dev.firebaseio.com"
});
const db = admin.firestore();

const { API_URL } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(catchError);
  server.use(session(server));
  server.use(bodyParser());
  server.use(cors());
  //server.use(proxy('feritas.serveo.net'))
  server.use(async (ctx, next) => {
    if (ctx.db === undefined) ctx.db = db;
    await next();
  });

  server.use(router());
  server.use(async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.on("error", logError);

  server.listen(port, () => {
    console.log(`> Ready on ${API_URL}:${port}`);
  });
});
