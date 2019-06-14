const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');
const sendRouter = require('./sendEmail')
const dbRouter = require('./databaseAction')

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter,
    sendRouter,
    dbRouter,
)

module.exports = router;