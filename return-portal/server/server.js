require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const cors = require("@koa/cors");
const dotenv = require("dotenv");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");

const getShopHeaders = require('./util/shop-headers');
dotenv.config();

//new CronJob("* * */23 * * *", warehouseOrder, null, true);

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  dir: "./client",
  
});
const handle = app.getRequestHandler();

const router = require("./routes/index");

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://flindel-dev.firebaseio.com"
});
const db = admin.firestore();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, DEBUG, APP_PROXY_PREFIX, API_URL} = process.env;

app.prepare().then(() => {
  const server = new Koa();
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
  server.keys = [SHOPIFY_API_SECRET_KEY];
  server.use(router());
  server.use(async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.listen(port, () => {
    console.log(`> Ready on ${API_URL}${APP_PROXY_PREFIX}:${port}`);
  });
});
