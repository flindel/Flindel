const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const productRouter = require('./products');
//const sendRouter = require('./sendEmail')
const checkProductRouter = require('./checkProducts')

router = combineRouters(
    rootRouter,
    orderRouter,
    productRouter,
    //sendRouter
    checkProductRouter
)

module.exports = router;