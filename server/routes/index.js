const combineRouters = require('koa-combine-routers');
const rootRouter = require('./root');
const orderRouter = require('./orders');
const collectionRouter = require('./collections');
const productRouter = require('./products');
const geoCodingRouter = require('./geocoding');
const shopRouter = require('./shop');
const scriptTag = require('./scriptTag');
const sendRouter = require('./sendEmail')
const blacklistRouter = require('./blacklistFunctions')
const returnItemRouter = require('./returnItem')
const returnRouter = require('./existingReturn')
const productsFirestoreRouter = require('./productsFirestore')

router = combineRouters(
    rootRouter,
    orderRouter,
    collectionRouter,
    productRouter,
    geoCodingRouter,
    shopRouter,
    scriptTag,
    sendRouter,
    blacklistRouter,
    returnItemRouter,
    returnRouter,
    productsFirestoreRouter,
)

module.exports = router;
