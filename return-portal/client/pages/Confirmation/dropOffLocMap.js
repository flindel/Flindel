"use strict";
import { Map, GoogleApiWrapper, Marker } from "google-maps-react";
import React from "react";
const mapStyles = {
  width: "35%",
  height: "50%"
};

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [
        { lat: 43.6567663, lng: -79.3831288 },
        { lat: 43.6565976, lng: -79.3878821 },
        { lat: 43.6526997, lng: -79.3963397 },
        { lat: 43.6520776, lng: -79.3888151 }
      ]
    };
    this.displayMarkers = this.displayMarkers.bind(this);
  }

  displayMarkers() {
    return this.state.stores.map((store, index) => {
      return (
        <Marker
          key={index}
          id={index}
          position={{
            lat: store.lat,
            lng: store.lng
          }}
        />
      );
    });
  }

  render() {
    return (
      <Map
        google={this.props.google}
        zoom={13}
        style={mapStyles}
        initialCenter={{
          lat: 43.657017,
          lng: -79.380586
        }}
      >
        {this.displayMarkers()}
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBKJRdYgS_I2MOgYgehTzixw1sJPYzs9x8"
})(MapContainer);
