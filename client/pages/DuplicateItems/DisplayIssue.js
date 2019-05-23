import React from "react";

const row = {
  display:'flex',
  flexWrap: 'wrap',
  justifyContent:'left',
  width: '700px'
};

const cell = {
  textAlign: 'left',
  margin: '10px',
  width: '200px',
  height: 'fill',
  padding: '0px',
};

const cellR = {
  textAlign: 'left',
  margin: '10px',
  width: '200px',
  height: 'fill',
  padding: '0px',
  backgroundColor: '#ff7575',
};

const cellG = {
  textAlign: 'left',
  margin: '10px',
  width: '200px',
  height: 'fill',
  padding: '0px',
  backgroundColor: '#99ff75',
};

function DisplayIssue(props){
  console.log("Display Issue Props: :", props);
  if (props.parameterIssues.length == 0
    && props.variantIssues.length == 0
    && props.issue == null){
    return null;
  } else {
    const headers = (props.variantIssues.length != 0
                    && props.parameterIssues.length != 0)
                    &&
                    (<div style={row}>
                      <div style={cell}>Parameter</div>
                      <div style={cell}>Orignal Value</div>
                      <div style={cell}>Get it Today Value</div>
                    </div>)

    const parameter_issues_display = props.parameterIssues.map(issue =>
      <div style={row}>
        <div style={cell}>{issue.parameter}</div>
        <div style={cellG}>{issue.norm}</div>
        <div style={cellR}>{issue.git}</div>
      </div>
    )
    const variant_issues_display = props.variantIssues.map(issue =>
      <div style={row}>
        <div style={cell}>variant.{issue.parameter}</div>
        <div style={cellG}>{issue.norm}</div>
        <div style={cellR}>{issue.git}</div>
      </div>
    )

    return (
      <div>
        <hr />
        <h4>{props.name}: {props.issue}</h4>
        <p>Fix: {props.solution}</p>
        <center>
          {headers}
          {parameter_issues_display}
          {variant_issues_display}
        </center>
      </div>

    )
  }
}
export default DisplayIssue;
