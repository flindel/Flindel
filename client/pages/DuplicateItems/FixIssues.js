import React, { Component } from 'react';
const shopName = "ds-test-yash-kini";

let updates = [];
class FixIssues extends Component {
  constructor(){
    super();
    this.state = {
    }
    this.setUpdates = this.setUpdates.bind(this);
  }

  handleClick(updates){
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
  }

  //PUT REQUEST
  //Copies the parameters from normal product to GIT product
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
