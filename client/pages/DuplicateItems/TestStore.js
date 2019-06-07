import React from "react"
const row = {
  backgroundColor: '#ff7575',
  height: '40px',
  display:'flex',
  flexWrap: 'wrap',
  justifyContent:'left',
};

const cell = {
  textAlign: 'left',
  margin: '10px',
  height: '30px',
  padding: '0px',
};

const city_poster_id = "2127802531937";
const serveo_name = "enim";

class TestStore extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  get(serveo_name, product_id){
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, {
      method: 'get',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => console.log('Data: ', data))
      .catch((error) => console.log("error"))
  }

  delete(serveo_name, product_id){
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, {
      method: 'delete',
      })
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => console.log('Data: ', data))
      .catch((error) => console.log("error"))
  }

  put(serveo_name, product_id, body){
    const options = {
      method: 'put',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(body),
    }
    fetch(`https://${serveo_name}.serveo.net/products?id=${encodeURIComponent(product_id)}`, options)
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => console.log('Data: ', data))
      .catch((error) => console.log("error"))
  }

  post(serveo_name, body){
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
        body: JSON.stringify(body),
    }
    fetch(`https://${serveo_name}.serveo.net/products`, options)
      .then((response) => {
        if(response.ok){return response.json()}
        else{throw Error(response.statusText)}
      })
      .then((data) => console.log('Data: ', data))
      .catch((error) => console.log("error"))
  }

  render(){
    return(
      <div style={row}>
        <h3>Dev Store Settings</h3>
        <button
          onClick={() => this.get("enim","2114548007009")}
          style={cell}>Put Request
        </button>
        <button style={cell}>Product Setup 1</button>
        <button style={cell}>Product Setup 2</button>
      </div>
    )
  }
}

export default TestStore;
