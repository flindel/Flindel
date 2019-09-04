//import {serveo_name} from '../config'
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const { API_URL } = publicRuntimeConfig;
let api_name = API_URL;

//posts Get it today product ID and original product ID to firestore.
export async function postProduct(data, callback = doNothing) {
  var temp;
  temp = await fetch(
    `${api_name}/firestore/product/git/?body=${encodeURIComponent(
      JSON.stringify(data)
    )}`,
    {
      method: "post"
    }
  );
  callback(data);
}

//gets pair of Git and Original product IDs, using a GIT ID.
export async function getGitProduct(gitID, callback = doNothing, args = []) {
  var temp;
  temp = await fetch(
    `${api_name}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`,
    {
      method: "get"
    }
  );
  var json = await temp.json();
  if (args == []) {
    return callback(formatJSON(json._fieldsProto));
  } else {
    return callback(formatJSON(json._fieldsProto), args);
  }
}

//deletes pair of GIT and Original product using GIT product ID.
export async function delProduct(gitID) {
  var temp;
  temp = await fetch(
    `${api_name}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`,
    {
      method: "delete"
    }
  );
}

//gets pair of Git and Original product IDs, using a Original product ID.
export async function getOrigProduct(orig_id, callback = doNothing) {
  var temp;
  temp = await fetch(
    `${api_name}/firestore/product/orig/?origID=${encodeURIComponent(orig_id)}`,
    {
      method: "get"
    }
  );
  var json = await temp.json();
  if (JSON.stringify(json) == "{}") {
    callback({ orig_id: orig_id });
  } else {
    return callback(formatJSON(json._fieldsProto));
  }
}

//Gets fulfillment service id from firestore
export async function getFulfillmentService() {
  var temp;
  temp = await fetch(`${api_name}/fulserv/firestore/id`, {
    method: "get"
  });
  var json = await temp.json();
  console.log("Shop: ", json);
  return json._fieldsProto.fulfillment_service.integerValue;
}

function doNothing(data) {
  console.log("doNothing: ", data);
}

//Only works for formatting Product JSONs
function formatJSON(json) {
  let newJSON = {};
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      if (json[key].valueType == "arrayValue") {
        newJSON.variants = formatJSONArray(json[key].arrayValue.values);
      } else {
        eval("newJSON." + key + " = " + "json[key]." + json[key].valueType);
      }
    }
  }
  return newJSON;
}
//helper for formatJSON
function formatJSONArray(array) {
  return array.map(x => formatJSON(x.mapValue.fields));
}
