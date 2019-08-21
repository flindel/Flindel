require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const dotenv = require("dotenv");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const { warehouseOrder } = require("./serverFunctions");
const { registerWebhook } = require("@shopify/koa-shopify-webhooks");
const { SERVEO_NAME } = process.env;
dotenv.config();

const cron = require("cron");
const { CronJob } = cron;

new CronJob("*/1 * * * * *", warehouseOrder, null, true);

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
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

const db = admin.firestore();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.use(bodyParser());
  server.use(async (ctx, next) => {
    if (ctx.db === undefined) {
      ctx.db = db;
    }
    await next();
  });
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
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
        "write_themes"
      ],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        // TODO: create the shop in the database and store the accessToken
        console.log("shop.............");
        console.log(shop);
        ctx.cookies.set("shop_id", shop);
        ctx.cookies.set("accessToken", accessToken);
        let tokenRef = ctx.db.collection("shop_tokens").doc(shop);
        try {
          await tokenRef.set({ token: accessToken });
        } catch (err) {
          console.log(err);
        }
        ctx.redirect("/");
        //HAS TO BE IN SERVER.js
        const registration = await registerWebhook({
          address: `https://${SERVEO_NAME}.serveo.net/hookendpoint`,
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
          address: `https://${SERVEO_NAME}.serveo.net/hookorderendpoint`,
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
          address: `https://${SERVEO_NAME}.serveo.net/hookthemeendpoint`,
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

  // server.use(verifyRequest());
  server.use(router());
  server.use(async ctx => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
