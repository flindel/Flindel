const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');

router = combineRouters(
    rootRouter,
    orderRouter
)

module.exports = router;
