const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/item"
});

router.get('/storeList', async ctx => {
    const store = ctx.query.store
    const db = ctx.db
    let itemList = []
    myRef = db.collection('items')
    let query = await myRef.where('store','==',store).where('status','==','returning').get()
    await query.forEach(doc=>{
      let tempItem = {
        name: doc._fieldsProto.name.stringValue,
        variantid: doc._fieldsProto.variantid.stringValue,
        productID: doc._fieldsProto.productid.stringValue,
        variantidGIT: doc._fieldsProto.variantidGIT.stringValue,
        productidGIT: doc._fieldsProto.productidGIT.stringValue,
        quantity: 1,
        value: 0
      }
      itemList.push(tempItem)
    })
    ctx.body = itemList
});

router.put('/returned', async ctx=>{
    const store = ctx.query.store
    const db = ctx.db
    let batch = db.batch();
    const id = ctx.query.id
    const quantity = ctx.query.quantity
    let count = 0
    let myRef = db.collection('items')
    let query = await myRef.where('status','==','returning').where('store','==',store).where('variantid','==', id).get()
    await query.forEach(async doc=>{
      if (count < quantity){
        count ++
        batch.update(doc.ref, {status: 'returned'})
      }
    })
    batch.commit()
    ctx.body = true
})

module.exports = router;
