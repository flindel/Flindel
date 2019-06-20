import {serveo_name} from '../config'

export async function postProduct(data){
  var temp;
  temp = await fetch(`https://${serveo_name}.serveo.net/dbcall/product/?body=${encodeURIComponent(JSON.stringify(data))}`, {
    method: 'post',
  });
}

export async function getProduct(gitID, callback){
  var temp;
  temp = await fetch(`https://${serveo_name}.serveo.net/dbcall/product/?gitID=${encodeURIComponent(gitID)}`, {
    method: 'get',
  })
  var json  = await temp.json();
  callback(formatJSON(json._fieldsProto))
}

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
