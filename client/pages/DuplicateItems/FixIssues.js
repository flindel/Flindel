import React, { Component } from 'react';
const shopName = "ds-test-yash-kini";

let updates = [];
const butterfly_id = "2114548007009";
const serveo_name = "enim";

class FixIssues extends Component {
  constructor(props){
    super(props);
    this.state = {
      hasError: false,
    }
    this.handleClick = this.handleClick.bind(this);
    this.setUpdates = this.setUpdates.bind(this);
  }

  post(body){
    console.log("POST");
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

  handleClick(updates){
    console.log("Updates: ", updates);
    for(let i=0; i < updates.length; i++) {
      switch(updates[i].issue){
        case "Unequal parameters":
          //this.fixUnequalParameters(updates[i]);
        case "\"Get it Today\" version of this product does not exist":
          this.fixGitDne(updates[i]);
        case "\"Original\" version of this \"Get it Today\" product does not exist":
          this.fixNormDne(updates[i]);
      }
    }
  }


  //PUT REQUEST
  //Copies the parameters from normal product to GIT product
  /*
  fixUnequalParameters(update){
    let out = {"id": update.gitId}
    for(let i = 0; i < update.parameterIssues.length; i++){
      let paraIssue = update.parameterIssues[i];
      eval(`out.${paraIssue.name} = ${paraIssue.norm}`);
    }

    console.log(out);
    return {
      "product": {
        "id":update.id,
      }
    }
  }
  */

  //POST REQUEST
  //Creates GIT product with same parameters as NORM
  fixGitDne(update){
    console.log("fixGitDne", update);
    let body = { "product": {
              "title": update.norm.title+" - Get it Today",
            }
    }
    this.post(body);

  }

  //DEL REQUEST
  //Deletes GIT version of product
  fixNormDne(update){
    console.log("fixNormDne");
    return null;
  }

  setUpdates(updates) {
    this.setState({updates: updates});
  }

  render(props){
    return(
      <form>
        <input type="button" value="Fix Now" onClick={() => this.handleClick(this.props.updates)} />
      </form>
    )
  }
}

export default FixIssues;
