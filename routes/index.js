const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter
)

module.exports = router;