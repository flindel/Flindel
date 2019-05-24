
const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');

router = combineRouters(
  rootRouter,
  orderRouter,
  collectionRouter
)

module.exports = router;
