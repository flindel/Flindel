const Router = require("koa-router");
const rp = require("request-promise");
const errors = require("request-promise/errors");
const { api_link } = require("../default-shopify-api.json");
const { getShopHeaders } = require("../util/shop-headers");
const router = Router({
  prefix: "/addValidation"
});
const geocodingKey = process.env.GOOGLE_GEOCODING_KEY;
const turf = require("@turf/turf");
const warehoue = turf.point([-79.3802531703975, 43.6566807319543]);

//define available deliver area with point
const Bathurst = [-79.411215, 43.666233];
const BloorEastJarvis = [-79.380506, 43.671632];
const BathurstAtQueens = [-79.39884, 43.636067];
const LowerJarvisAndQueens = [-79.368976, 43.643972];
const DeliverPoly = turf.polygon([
  [Bathurst, BloorEastJarvis, LowerJarvisAndQueens, BathurstAtQueens, Bathurst]
]);

router.get("/", async ctx => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");

  const postalCode = ctx.query.postalCode;
  //console.log("postal code:---------"+postalCode)
  const option = {
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
      postalCode
    )}&key=${geocodingKey}&format=json`
  };

  try {
    let resp = await rp(option);
    resp = JSON.parse(resp);
    let valid = false;
    //do lat and long check
    if (resp.status == "400") {
      console.log("no such postal code");
      ctx.body = { valid: false };
    } else if (resp.status == "OK") {
      let destination = turf.point([
        resp.results[0].geometry.location.lng,
        resp.results[0].geometry.location.lat
      ]);
      //console.log("destination---"+JSON.stringify(destination))
      //console.log("inside???"+turf.booleanPointInPolygon(destination, DeliverPoly))
      if (turf.booleanPointInPolygon(destination, DeliverPoly)) {
        valid = true;
      }
    } else {
      //console.log(resp)
      valid = false;
    }
    ctx.body = { valid: valid };
    //console.log("ctx-------"+JSON.stringify(ctx.body))
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
