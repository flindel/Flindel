const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');
const productRouter = require('./products');
const dbGitRouter = require('./databaseActionGit');
const geoCodingRouter = require('./geocoding');
const shopRouter = require('./shop');
const scriptTag = require('./scriptTag');
const sendRouter = require('./sendEmail')
const dbRouter = require('./databaseAction')
const shopNameRouter = require('./shopName')

router = combineRouters(
    rootRouter,
    orderRouter,
    collectionRouter,
    productRouter,
    dbGitRouter,
    geoCodingRouter,
    shopRouter,
    scriptTag,
    sendRouter,
    dbRouter,
    shopNameRouter,
)

module.exports = router;
