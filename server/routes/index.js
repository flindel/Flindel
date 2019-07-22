const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');
const productRouter = require('./products');
const dbGitRouter = require('./databaseActionGit');
const geoCodingRouter = require('./geocoding');
const shopRouter = require('./shop');
const scriptTag = require('./scriptTag');

router = combineRouters(
    rootRouter,
    orderRouter,
    collectionRouter,
    productRouter,
    dbGitRouter,
    geoCodingRouter,
    shopRouter,
    scriptTag,
)

module.exports = router;
