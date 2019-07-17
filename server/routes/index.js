const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');
const sendRouter = require('./sendEmail')
const dbRouter = require('./databaseAction')
const shopRouter = require('./shopName')
const GEORouter = require('./geocoding')

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter,
    sendRouter,
    dbRouter,
    GEORouter,
    shopRouter
)

module.exports = router;
