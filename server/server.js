require("isomorphic-fetch");
const Koa = require("koa");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const dotenv = require("dotenv");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const {
  receiveWebhook,
  registerWebhook
} = require("@shopify/koa-shopify-webhooks");
dotenv.config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
  dir: "./client"
});
const handle = app.getRequestHandler();

const router = require("./routes/index");

// const admin = require('firebase-admin');

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
// });

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.use(bodyParser());
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        "read_products",
        "write_products",
        "read_orders",
        "write_fulfillments",
        "read_fulfillments",
        "read_inventory"
      ],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        // TODO: create the shop in the database and store the accessToken
        console.log("shop.............");
        console.log(shop);
        ctx.cookies.set("shop_id", shop);
        ctx.cookies.set("accessToken", accessToken);
        ctx.redirect("/");

        // const registration = await registerWebhook({
        //   address: "https://suus.serveo.net/hookendpoint",
        //   topic: "FULFILLMENTS_CREATE",
        //   accessToken,
        //   shop
        // });
        const registration = await registerWebhook({
          address: "https://suus.serveo.net/hookendpoint",
          topic: "PRODUCTS_CREATE",
          accessToken,
          shop
        });
        if (registration.success) {
          console.log("webhooks registered");
        } else {
          console.log("Failed to webhook ", registration.result);
        }
      }
    })
  );
  server.use(
    receiveWebhook({
      path: "/hookendpoint",
      secret: SHOPIFY_API_SECRET_KEY,
      onReceived(ctx) {
        console.log("received webhook: ", ctx.state.webhook);
        console.log("AAAAAAA", ctx.request.body);
        var hookload = ctx.request.body;
      }
    })
  );
  server.use(verifyRequest());
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
