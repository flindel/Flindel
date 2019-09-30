"use strict";
const rp = require("request-promise");
const { api_link } = require("../default-shopify-api.json");
const expired = require("./expiredHelper");

//edit inventory in shopify
async function editInventory(change, store, varID, locoIn, dbIn) {
  let { accessToken, torontoLocation } = await getAccessToken(dbIn, store);
  let invId = await getInvID(store, varID, accessToken);
  increment(change, torontoLocation, invId, store);
}

//get access token and toronto location from databse (expand later)
async function getAccessToken(dbIn, store) {
  const db = dbIn;
  let myRefToken = db.collection("shop_tokens").doc(store);
  let getToken = await myRefToken.get();
  let accessToken = getToken._fieldsProto.token.stringValue; //access token stored here
  let myRefLocation = db.collection("store").doc(store);
  let getLocation = await myRefLocation.get();
  let torontoLocation = getLocation._fieldsProto.torontoLocation.stringValue;
  return { accessToken, torontoLocation };
}

//get inventory ID
async function getInvID(store, varID, accessToken) {
  let option = {
    url: `https://${store}/${api_link}/variants/${varID}.json`,
    headers: {
      "X-Shopify-Access-Token": accessToken
    },
    json: true
  };
  let temp = await rp(option);
  let invId = temp.variant.inventory_item_id;
  return invId;
}

//actually increment inventory
async function increment(quantity, torontoLocation, invId, store) {
  let option2 = {
    method: "POST",
    url: `https://${store}/${api_link}/inventory_levels/adjust.json`,
    headers: {
      Authorization: process.env.SHOP_AUTH
    },
    json: true,
    body: {
      location_id: torontoLocation,
      inventory_item_id: invId,
      available_adjustment: quantity
    }
  };
  //actually update
  await rp(option2);
}

module.exports = { editInventory, getInvID, getAccessToken, increment };
