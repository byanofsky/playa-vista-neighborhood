var Config = function() {
  // Set location center
  this.locationCenter = {lat: 33.9739136, lng: -118.4161883};
  // Set backend server url to make calls to yelp api
  this.yelpApiUrl = "http://localhost:5000/";
};

var config = new Config();
