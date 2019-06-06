const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');
const sendRouter = require('./sendEmail')

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter,
    sendRouter,
)

module.exports = router;