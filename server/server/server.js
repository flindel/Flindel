require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const dotenv = require("dotenv");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const {
  calculateDistance,
  getLatLng,
  sendEmail
} = require("./serverFunctions");
const {
  receiveWebhook,
  registerWebhook
} = require("@shopify/koa-shopify-webhooks");
dotenv.config();

const cron = require("cron");
const { CronJob } = cron;

new CronJob(
  "* * */23 * * *",
  function() {
    fetch(`https://${serveo_name}.serveo.net/dbcall/warehouse_order`, {
      method: "post"
    });
  },
  null,
  true
);

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
        "write_inventory"
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

        const registration = await registerWebhook({
          address: "https://suus.serveo.net/hookendpoint",
          topic: "FULFILLMENTS_CREATE",
          accessToken,
          shop
        });
        // const registration = await registerWebhook({
        //   address: "https://suus.serveo.net/hookendpoint",
        //   topic: "PRODUCTS_CREATE",
        //   accessToken,
        //   shop
        // });
        if (registration.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration.result);
        }
        const registration1 = await registerWebhook({
          address: "https://suus.serveo.net/hookorderendpoint",
          topic: "ORDERS_CREATE",
          accessToken,
          shop
        });
        if (registration1.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration1.result);
        }
      }
    })
  );
  server.use(
    receiveWebhook({
      path: "/hookendpoint",
      secret: SHOPIFY_API_SECRET_KEY,
      async onReceived(ctx) {
        ctx.response.status = 200; //tell shopify that we got payload
        ctx.body = "OK";

        let hookload = ctx.request.body;

        for (let i = 0; i < hookload.variants.length; i++) {
          //instead of variants it should be line_items
          if (hookload.variants[i].fulfillment_service == "flindel") {
            console.log("found flindel");
            let fJSON = ctx.request.body.variants;
            sendEmail(fJSON);
            fetch(
              `https://${serveo_name}.serveo.net/dbcall/update_order_database?items=${fJSON}&id=${encodeURIComponent(
                JSON.stringify(hookload.order_id)
              )}`,
              {
                method: "post"
              }
            );
          } else {
            console.log("not found");
          }
        }
      }
    })
  );
  server.use(
    receiveWebhook({
      path: "/hookorderendpoint",
      secret: SHOPIFY_API_SECRET_KEY,
      async onReceived(ctx) {
        ctx.response.status = 200;

        let hookload = ctx.request.body;

        let address =
          hookload.shipping_address.address1 +
          "," +
          hookload.shipping_address.city +
          "," +
          hookload.shipping_address.province;

        let latlng = await getLatLng(address);
        latlng = latlng.results[0].geometry.location;
        let validLocation = calculateDistance(latlng);
        //console.log(distance);
        if (validLocation == false) {
          console.log("TOO FAR");
          fetch(
            `https://${serveo_name}.serveo.net/cancelOrder?id=${encodeURIComponent(
              JSON.stringify(hookload.id)
            )}`,
            {
              method: "post"
            }
          );
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
