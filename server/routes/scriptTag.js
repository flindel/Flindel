const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const { scriptTagDB } = require('../util/scriptTagHelper')

const router = Router({
    prefix: '/scriptTag'
});
 
 //!!!!!!!!import should change this to '/shopify after finish'
  router.post('/', async ctx => {
      // post a scripttag to shopify
      const { shop, accessToken } = getShopHeaders(ctx);
      const headers = {};
      if (process.env.DEBUG) {
          headers['Authorization'] = process.env.SHOP_AUTH;
      } else {
          headers['X-Shopify-Access-Token'] = accessToken;
      }
      
      const option = {
          method: 'POST',
          url: `https://${shop}/${api_link}/script_tags.json`,
          headers: headers,
          json: true,
          body: ctx.request.body
      }
      try {
          ctx.body = await rp(option);
      } catch (err) {
          console.log(err.message);
          if (err instanceof errors.StatusCodeError) {
              ctx.status = err.statusCode;
              ctx.message = err.message;
          } else if (err instanceof errors.RequestError) {
              ctx.status = 500;
              ctx.message = err.message;
          }
      }
  });

  //delete a scriptTag from shopify API
  router.delete('/shopify', async ctx => {
    const { shop, accessToken } = getShopHeaders(ctx);
    const headers = {};
    if (process.env.DEBUG) {
        headers['Authorization'] = process.env.SHOP_AUTH;
    } else {
        headers['X-Shopify-Access-Token'] = accessToken;
    }
    //id is the scriptTag id
    let id = ctx.query.id
    const option = {
        method: 'DELETE',
        url: `https://${shop}/${api_link}/script_tags/${id}.json`,
        headers: headers,
        json: true,
    }
    try {
        ctx.body = await rp(option);
    } catch (err) {
        console.log(err.message);
        if (err instanceof errors.StatusCodeError) {
            ctx.status = err.statusCode;
            ctx.message = err.message;
        } else if (err instanceof errors.RequestError) {
            ctx.status = 500;
            ctx.message = err.message;
        }
    }
  })

  //get all scriptTags' url for a shop
  router.get('/db/src', async ctx => {
    let shop = ctx.query.shop;
    db = ctx.db
    let myRef = db.collection('scripttag').doc(shop);
    try{
        getDoc = await myRef.get()
        ctx.body = getDoc.data().src
        console.log(JSON.stringify(ctx.body))
    } catch(err) {
        console.log("Err on getting doc in scripttag collection", err)
    }

    //update a single scripttag id in firebase
    //call this right after finishing posting scriptTag to Shopify API
    router.push('/db/id', async ctx => {
        let shop = ctx.query.shop
        let id = ctx.query.id
        let url = ctx.query.url
        //define nestedIdentifier
        let src = `src.${url}`
        db = ctx.db
        let updateIdQuery = db.collection('scripttag').doc(shop).update({
            src:id
        })
        ctx.body={'success':true}
    })

    //get all scripttag ids of a single store from firebase
    router.get('/db/ids', async ctx =>{
        let ids = []
        let shop = ctx.query.shop
        db = ctx.db
        let myRef = db.collection('scripttag').doc(shop);
        try{
            getDoc = await myRef.get()
            //Array of all scriptTag ids of a single store
            ids = getDoc.data().src.values()
            ctx.body = {'ids':ids}

        }catch(err){
            console.log("Err on getting doc in scripttag collection", err)
        }
    })

    //delete certain doc in scripttag collection, should be called after deleting scriptTag from Shopify API when uninstall APP
    router.delete('/db', async ctx =>{
        let shop = ctx.query.shop
        db = ctx.db
        let deleteDoc = db.collection('scripttag').doc(shop).delete()
        ctx.body = {'success':true}
    })
    
  })

module.exports = router;
