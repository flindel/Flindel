require('isomorphic-fetch');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const dotenv = require('dotenv');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
dotenv.config();
const cronUtil = require('./util/cronFunction')
const cron = require('cron')
const { CronJob } = cron;


const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  dir: './client'
});
const handle = app.getRequestHandler();

const router = require('./routes/index');

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://flindel-dev.firebaseio.com'
});
const db = admin.firestore();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, DEBUG } = process.env;

app.prepare().then(() => {
  const server = new Koa();
  server.use(session(server));
  server.use(bodyParser());
  server.use(async (ctx, next) => {
    if (ctx.db === undefined) ctx.db = db;
    await next();
  });
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'read_orders', 'write_products'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        // TODO: create the shop in the database and store the accessToken
        console.log('shop.............');
        console.log(accessToken);
        console.log(shop);
        ctx.cookies.set('shop_id', shop);
        ctx.cookies.set('accessToken', accessToken);
        let tokenRef = ctx.db.collection('shop_tokens').doc(shop);
        try {
          await tokenRef.set({token: accessToken});
        } catch (err) {
          console.log(err);
        }
        ctx.redirect('/');
      },
    }),
  );

  // if you can find ways to verify request with postman, please tell me
  if (!DEBUG) server.use(verifyRequest());
  server.use(router());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
