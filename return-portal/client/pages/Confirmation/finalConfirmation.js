"use strict";
import React from "react";
import Item from "./Item2";

/* Final confirmation page
Allow customer to look over one more time before submit
*/

class finalPage extends React.Component {
  constructor(props) {
    super(props);
  }

  //display
  render() {
    return (
      <div>
        <div className="itemList">
          <fieldset className="page2">
            {/* <p className = 'orderHeader'>Order Number: {this.props.orderNum}</p> */}
            <br />
            {this.props.items.map((item, index) => {
              return (
                <Item
                  shop={this.props.shop}
                  item={item}
                  serveoname={this.props.serveoname}
                  step={3}
                  review={true}
                  key={index}
                />
              );
            })}
          </fieldset>
        </div>
        <br />
        {/* if on review and restart button, do not show submit button */}
        {this.props.review ? null : (
          <div>
            <div className="fixed-footer"></div>
            <footer className="f1">
              <button className="Submit2" onClick={this.props.finishOrder}>
                SUBMIT
              </button>
            </footer>
          </div>
        )}
      </div>
    );
  }
}

export default finalPage;
