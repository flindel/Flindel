import {serveo_name} from '../config'

export async function postInstallTime(data){
  var temp;
  temp = await fetch(`${serveo_name}/shop/install_time/?body=${encodeURIComponent(JSON.stringify(data))}`, {
    method: 'post',
  })
}

export async function postProduct(data, callback = doNothing){
  var temp;
  temp = await fetch(`${serveo_name}/firestore/product/git/?body=${encodeURIComponent(JSON.stringify(data))}`, {
    method: 'post',
  })
  callback(data);
}

export async function getGitProduct(gitID, callback = doNothing, args = []){
  var temp;
  temp = await fetch(`${serveo_name}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`, {
    method: 'get',
  })
  var json  = await temp.json();
  if (args == []){
    return callback(formatJSON(json._fieldsProto))
  }
  else {
    return callback(formatJSON(json._fieldsProto), args)
  }
}

export async function delProduct(gitID){
  var temp;
  temp = await fetch(`${serveo_name}/firestore/product/git/?gitID=${encodeURIComponent(gitID)}`, {
    method: 'delete',
  })
}

export async function getOrigProduct(orig_id, callback = doNothing){
 var temp;
 temp = await fetch(`${serveo_name}/firestore/product/orig/?origID=${encodeURIComponent(orig_id)}`, {
   method: 'get',
 })
 var json  = await temp.json();
 if (JSON.stringify(json) == "{}"){
   callback({orig_id: orig_id})
 }else{
   return callback(formatJSON(json._fieldsProto));
 }
}

function doNothing(data){console.log("doNothing: ", data)}

//Only works for formatting Product JSONs
function formatJSON(json){
  let newJSON = {};
  for (var key in json) {
    if (json.hasOwnProperty(key)) {
      if(json[key].valueType == "arrayValue"){
        newJSON.variants = formatJSONArray(json[key].arrayValue.values);
      }else{
        eval("newJSON."+key+" = "+"json[key]."+json[key].valueType);
      }
    }
  }
  return newJSON;
}

function formatJSONArray(array){return array.map(x => formatJSON(x.mapValue.fields));}
