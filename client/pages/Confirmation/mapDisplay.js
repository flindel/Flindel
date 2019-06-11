import React from 'react'

/* This page shows the message for return instructions and map */
class PickupDisplay extends React.Component{
  render(){
    return (
    <div>
      <div>
          <h2>Pickup Instructions:</h2>
          <p>1. Request return on Flindel and receive confirmation code (e.g. A1B2C3)</p>
          <p> 2. Present your code and give your return item(s) to one of the staff at one of the locations on the map</p>
          <h4>Look for someone wearing a red shirt carrying a big bag!</h4>
          <p>3. Wait for your refund!</p>
      </div>
    </div>
    );
  }
}

export default PickupDisplay;























/*// Initialize and add the map
    initMap() 
    {
	//setting up directions
  var directionDisplay = new google.maps.DirectionsRenderer();
  var directionService = new google.maps.DirectionsService();
  // location[0] of toronto
  var locations =[{lat: 43.6532, lng: -79.3832},{lat: 43.6502, lng: -79.3532},{lat:43.647565,lng:-79.413881}];
  // The map, centered at toronto
  var map = new google.maps.Map(
      document.getElementById('map'), {zoom: 13, center: locations[0]});
  var i;    
  for(i=0;i<locations.length;i++){
   	new google.maps.Marker({position:locations[i],title:String(locations[i].lat + "," + locations[i].lng),map});
  }
  //can make as much markers as we want just need to a list of latitude and longitude
    }*/