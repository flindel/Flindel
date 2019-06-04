import React, { Component } from 'react';
const shopName = "ds-test-yash-kini";

let updates = [];
const butterfly_id = "2114548007009";
const serveo_name = "enim";

class FixIssues extends Component {
  constructor(props){
    super(props);
    this.state = {
    }
    this.handleClick = this.handleClick.bind(this);
    this.setUpdates = this.setUpdates.bind(this);
  }

  handleClick(updates){
    console.log("Handle Click");
    const options = {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
        body: JSON.stringify({ "product": {
                  "title": "New Product",
                  "body_html": "<strong>Good snowboard!</strong>",
                  "vendor": "Burton",
                  "product_type": "Snowboard",
                  "tags": "Barnes & Noble, John's Fav, \"Big Air\""
                }
              }),

    }
    fetch(`https://${serveo_name}.serveo.net/products`, options)
      .then(function(response) {
          //return response.json();
        }).then(function(data) {
          //console.log('Created Gist:', data.html_url);
        });

    /*
    console.log("Updates", updates);
    for(let i=0; i < updates.length; i++) {
      switch(updates[i].issue){
        case "Unequal parameters":
          this.fixUnequalParameters(updates[i]);
        case "\"Get it Today\" version of this product does not exist":
          this.fixGitDne(updates[i]);
        case "\"Original\" version of this \"Get it Today\" product does not exist":
          this.fixNormDne(updates[i]);
      }
    }
    */
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
    console.log("fixGitDne");
    return null;
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
