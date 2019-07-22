const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');
const sendRouter = require('./sendEmail')
const dbRouter = require('./databaseAction')
const shopRouter = require('./shopName')

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter,
    sendRouter,
    dbRouter,
    shopRouter
)

module.exports = router;