const Router = require('koa-router');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const { api_link } = require('../default-shopify-api.json');
const { getShopHeaders } = require('../util/shop-headers');
const router = Router({
    prefix: '/addValidation'
});
const geocodingKey = process.env.GOOGLE_GEOCODING_KEY
const turf = require('@turf/turf')
const warehoue = turf.point([-79.3802531703975,43.6566807319543])

//Delivery radius in km
const deliveryDis = 10

router.get('/', async ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    
    const postalCode = ctx.query.postalCode;
    console.log("postal code:---------"+postalCode)
     const option = {
         url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(postalCode)}&key=${geocodingKey}&format=json`,
     }

    try {
        let resp = await rp(option)
        resp = JSON.parse(resp)
        //console.log("resp+++++++++"+typeof(resp))
        //console.log("res[0]----"+resp[0])
        
        let valid = false
        //do lat and long check
        if(resp.status=="ZERO_RESULTS"){
            console.log('no such postal code')
            ctx.body = {"valid":false}
        }else if(resp.status=="OK"){
            let destination = turf.point([resp.results[0].geometry.location.lng, resp.results[0].geometry.location.lat])
            let distance = turf.distance(warehoue, destination)
            console.log("distance="+distance)
            if(distance<=deliveryDis){
                valid = true
            }
        }else{
            console.log(resp)
            valid = "bad request"
        }
        ctx.body = {"valid":valid}
        
        console.log("ctx-------"+JSON.stringify(ctx.body))
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


module.exports = router;