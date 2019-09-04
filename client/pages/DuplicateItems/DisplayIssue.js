import React from "react";

let key = 0;

const row = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "left",
  width: "700px"
};

const cell = {
  textAlign: "left",
  margin: "10px",
  width: "200px",
  height: "fill",
  padding: "0px"
};

const cellR = {
  textAlign: "left",
  margin: "10px",
  width: "200px",
  height: "fill",
  padding: "0px",
  backgroundColor: "#ff7575"
};

const cellG = {
  textAlign: "left",
  margin: "10px",
  width: "200px",
  height: "fill",
  padding: "0px",
  backgroundColor: "#99ff75"
};

const text = {
  textAlign: "left"
};

//Formats a single entry for an issue in the update products app
function DisplayIssue(props) {
  if (
    props.parameterIssues.length == 0 &&
    props.variantIssues.length == 0 &&
    props.issue == null
  ) {
    return null;
  } else {
    let parameter_issues_display = props.parameterIssues.map(issue => (
      <div style={row} key={key++}>
        <div style={cell}>{issue.parameter}</div>
        <div style={cellG}>{issue.norm}</div>
        <div style={cellR}>{issue.git}</div>
      </div>
    ));
    let variant_issues_display = props.variantIssues.map(issue => (
      <div style={row} key={key++}>
        <div style={cell}>
          {issue.title} -> {issue.parameter}
        </div>
        <div style={cellG}>{issue.norm}</div>
        <div style={cellR}>{issue.git}</div>
      </div>
    ));
    let headers;
    if (props.issue == "Unequal parameters") {
      headers = (
        <div style={row} key={key++}>
          <div style={cell}>Parameter</div>
          <div style={cell}>Orignal Value</div>
          <div style={cell}>Get it Today Value</div>
        </div>
      );
    }
    if (
      props.issue ==
      "The Original item has information that conflicts with Get it Today"
    ) {
      headers = (
        <div style={row} key={key++}>
          <div style={cell}>Parameter</div>
          <div style={cell}>New Value</div>
          <div style={cell}>Current Value</div>
        </div>
      );
    }
    if (
      props.issue == "The Get it Today item has incorrect product information"
    ) {
      headers = (
        <div style={row} key={key++}>
          <div style={cell}>Parameter</div>
          <div style={cell}>Correct Value</div>
          <div style={cell}>Current Value</div>
        </div>
      );
    }
    if (
      props.issue ==
        '"Get it Today" version of this product variant does not exist' ||
      props.issue ==
        '"Original" version of this "Get it Today" product variant does not exist'
    ) {
      variant_issues_display = props.variantIssues.map(issue => (
        <div style={row} key={key++}>
          <div style={cell}>Variant Name: {issue.title}</div>
          <div style={cell}>{}</div>
          <div style={cell}>{}</div>
        </div>
      ));
    }

    return (
      <div>
        <hr />
        <h4 style={text}>
          {props.name}: {props.issue}
        </h4>
        <p style={text}>Update: {props.solution}</p>
        <center>
          {headers}
          {parameter_issues_display}
          {variant_issues_display}
        </center>
      </div>
    );
  }
}

export default DisplayIssue;
