const dotenv = require("dotenv");
const turf = require("@turf/turf");
dotenv.config();
const GOOGLE_GEO_API_KEY = process.env.GOOGLE_GEOCODING_KEY;
const serveo_name = "https://923e8fe8.ngrok.io";

async function getLatLng(address) {
  //console.log()
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
    `https://${serveo_name}.serveo.net/send/warehouse?package=${encodeURIComponent(
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

function getTime() {
  let now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let year = now.getFullYear();
  let hour = now.getHours();
  let minute = now.getMinutes().toString();
  if (minute.length != 2) {
    minute = "0" + minute;
  }
  let second = now.getSeconds().toString();
  if (second.length != 2) {
    second = "0" + second;
  }
  let currTime =
    month + "/" + day + "/" + year + "-" + hour + ":" + minute + ":" + second;
  return currTime;
}
module.exports.warehouseOrder = warehouseOrder;
module.exports.calculateDistance = calculateDistance;
module.exports.sendEmail = sendEmail;
module.exports.getLatLng = getLatLng;
module.exports.getTime = getTime;
