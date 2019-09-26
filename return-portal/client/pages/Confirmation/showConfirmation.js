"use strict";
import React from "react";
//change this to live map when time comes
import MapContainer from "./dropOffLocMap";
const imageAddress =
  "data:image/jpeg;base64,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";
/* FINAL PAGE
Thank you for ordering, pickup information etc
 */
class finalPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: this.props.email,
      code: this.props.code,
      minute: -99
    };
    this.sendEmail = this.sendEmail.bind(this);
  }

  //resend email if necessary
  sendEmail() {
    let now = new Date();
    let currentMinute = now.getMinutes();
    if (currentMinute != this.state.minute) {
      this.setState({ minute: currentMinute });
      fetch(
        `https://${
          this.props.serveoname
        }/send/confirmation?email=${encodeURIComponent(
          this.state.email
        )}&code=${encodeURIComponent(this.state.code)}`,
        {
          method: "POST"
        }
      );
    } else {
      alert(
        "An email has already been sent. Please wait and see if it arrives before sending another."
      );
    }
  }

  //display
  render() {
    return (
      <div>
        <div className="centre">
          <h2 className="confirmCode">
            Your confirmation code is: <strong>{this.props.code}</strong>
          </h2>

          <h3 className="confirmTitle">Thank you for your return request.</h3>

          <p className="explanation">
            A confirmation email has been sent to {this.props.email}. To make
            sure that we can process your return as quickly as possible, please
            follow these steps when returning your package.
          </p>
          <button className="Submit2" onClick={this.sendEmail}>
            Resend email
          </button>
        </div>
        <br></br>
        <div className="confirmation1">
          <h2 className="confirmation">Item Drop-off Instructions</h2>
          <div className="instructions">
            <br />
            <p>
              Request return on Flindel and receive confirmation code (e.g.
              A1B2C3)
            </p>
            <p>
              Present your code and give your return item(s) to one of the staff
              at one of the locations on the map. Look for someone wearing a red
              shirt carrying a big bag!
            </p>
            <p>Wait for your refund!</p>
          </div>
        </div>
        <div className="confirmation2">
          <h2 className="confirmation">Drop-Off Locations</h2>
          <div className="dropLocations">
            {/* Below is dynamic google maps component*/}
            <div className="mapContainer">
              <MapContainer />
            </div>
            <div className="dropAdd">
              <p className="dropAddress">1. 123 Dundas Street (Starbucks)</p>
              <p className="dropAddress">
                2. 987 Bathurst Street (Tim Hortons)
              </p>
              <p className="dropAddress">3. 456 Front Street (Library) </p>
              <p className="dropAddress">4. 159 Wilson Street (Starbucks)</p>
              <p className="dropAddress">5. 354 Bay Street (Store)</p>
            </div>
          </div>
        </div>
        <div className="customerService">
          <p>
            If you have any questions, <br />
            please contact us at{" "}
            <a href="mailto:customerservice@flindel.com">
              customerservice@flindel.com
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default finalPage;
