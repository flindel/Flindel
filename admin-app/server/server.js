require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const cors = require("@koa/cors");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const dotenv = require("dotenv");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const { warehouseOrder } = require("./serverFunctions");
const { registerWebhook } = require("@shopify/koa-shopify-webhooks");
//const { SERVEO_NAME } = process.env;
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

//new CronJob("*/30 * * * * *", warehouseOrder, null, true);
//second (0-59) - minute (0-59) - hour(0-23) - day of month (1-31) - Month (1-12) - Day of Week (0-6, Sun-Sat)
new CronJob(
  "*/10 * * * * *",
  async function() {
    //KEEP THIS ORDER OF STUFF. unblock all when we go live, set time '0 0 0 * * *'
    //await cronUtil.checkExpired(db);
    //await cronUtil.handlePending(db)
    //await cronUtil.fulfillmentReport(db)
  },
  null,
  true
);

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

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, API_URL, DEBUG } = process.env;
const SERVEO_NAME = API_URL.substring(8);

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

    //app.setAssetPrefix('flindel-returns');
    //console.log(ctx)
    await next();
  });
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      //THIS KEEPS GETTING DELETED AND I NEED IT
      //prefix:'/app/flindel-returns',
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        "read_products",
        "write_products",
        "read_orders",
        "write_orders",
        "write_fulfillments",
        "read_fulfillments",
        "read_inventory",
        "write_inventory",
        "read_themes",
        "write_themes",
        "read_script_tags",
        "write_script_tags",
        "read_price_rules"
      ],
      accessMode: "offline",
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        // TODO: create the shop in the database and store the accessToken
        //console.log('shop.............');
        //console.log(accessToken);
        //console.log(shop);
        // ctx.cookies.set("shop_id", shop);
        // ctx.cookies.set("accessToken", accessToken);
        let tokenRef = ctx.db.collection("shop_tokens").doc(shop);
        try {
          await tokenRef.set({ token: accessToken });
        } catch (err) {
          console.log(err);
        }
        ctx.redirect("/");
        //HAS TO BE IN SERVER.js
        const registration = await registerWebhook({
          address: `${API_URL}/hookendpoint`,
          topic: "FULFILLMENTS_CREATE",
          accessToken,
          shop
        });
        if (registration.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration.result);
        }
        const registration1 = await registerWebhook({
          address: `${API_URL}/hookorderendpoint`,
          topic: "ORDERS_CREATE",
          accessToken,
          shop
        });
        if (registration1.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration1.result);
        }

        const registration2 = await registerWebhook({
          address: `${API_URL}/hookthemeendpoint`,
          topic: "THEMES_PUBLISH",
          accessToken,
          shop
        });
        if (registration2.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration1.result);
        }
      }
    })
  );

  server.use(accessToken);
  server.use(verifyRequest());
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
