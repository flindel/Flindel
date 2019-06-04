const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');
const productRouter = require('./products');

router = combineRouters(
    rootRouter,
    orderRouter,
    collectionRouter,
    productRouter,
)

module.exports = router;
