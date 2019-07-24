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
const blacklistRouter = require('./blacklistFunctions')
const returnItemRouter = require('./returnItem')
const returnRouter = require('./existingReturn')

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
    blacklistRouter,
    returnItemRouter,
    returnRouter
)

module.exports = router;
