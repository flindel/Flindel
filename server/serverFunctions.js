const dotenv = require("dotenv");
const turf = require("@turf/turf");
dotenv.config();
const GOOGLE_GEO_API_KEY = process.env.GOOGLE_GEO_API_KEY;
const serveo_name = "suus";

async function getLatLng(address) {
  console.log(GOOGLE_GEO_API_KEY);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_GEO_API_KEY}`
  );
  let json = await response.json();
  return json;
}

function calculateDistance(p1) {
  let pt = turf.point([p1.lng, p1.lat]);
  let poly = turf.polygon([
    [
      [-79.4147, 43.6742],
      [-79.375357964, 43.672409816],
      [-79.36897, 43.64391],
      [-79.385437012, 43.64868927],
      [-79.4147, 43.6742]
    ]
  ]);
  return turf.booleanPointInPolygon(pt, poly);
}

function sendEmail(json) {
  fetch(
    `https://${serveo_name}.serveo.net/sendEmail?package=${encodeURIComponent(
      JSON.stringify(json)
    )}`,
    {
      method: "post"
    }
  )
    //.then(data => console.log("Data: ", data))
    .catch(error => console.log("error", error));
}

function warehouseOrder() {
  fetch(`https://${serveo_name}.serveo.net/dbcall/warehouse_order`, {
    method: "post"
  });
}

module.exports.warehouseOrder = warehouseOrder;
module.exports.calculateDistance = calculateDistance;
module.exports.sendEmail = sendEmail;
module.exports.getLatLng = getLatLng;
