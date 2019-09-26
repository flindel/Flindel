"use strict";
require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const cors = require("@koa/cors");
const dotenv = require("dotenv");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");

const { catchError, logError } = require("./error");
const getShopHeaders = require("./util/shop-headers");
const { accessToken } = require("./util/acessTokenDB");
dotenv.config();

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

const { APP_PROXY_PREFIX, API_URL } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(catchError);
  server.use(session(server));
  server.use(bodyParser());
  server.use(cors());
  //server.use(proxy('feritas.serveo.net'))
  server.use(async (ctx, next) => {
    if (ctx.db === undefined) ctx.db = db;
    //console.log(ctx.request.host);
    //console.log(ctx.request)
    //----------------------------for app proxy---------------------
    //if (ctx.request.host === 'feritas.serveo.net') {
    //app.setAssetPrefix('');
    //} else {
    //app.setAssetPrefix('flindel-returns');
    //}
    //server.use(proxy('feritas.serveo.net'))
    app.setAssetPrefix(APP_PROXY_PREFIX);
    //console.log(ctx)

    await next();
  });

  server.use(accessToken);
  server.use(router());
  server.use(async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.on("error", logError);

  server.listen(port, () => {
    console.log(`> Ready on ${API_URL}${APP_PROXY_PREFIX}:${port}`);
  });
});
