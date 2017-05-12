var ViewModel = function() {
  var self = this;

  self.locations = ko.observableArray();
  self.activeLocation = ko.observable();
  self.types = ko.observableArray(
    [
      { value: 'restaurant', label: 'Restaurants' },
      { value: 'bar', label: 'Bars' },
      { value: 'cafe', label: 'Cafes' },
      { value: 'school', label: 'Schools' }
    ]
  );

  // Behaviors

  // Toggle active class on list items
  self.selectListItem = function(location) {
    self.activeLocation(location);
    focusMarker(location.marker, location.name);
  };
  // Add a location to observable array
  self.addLocation = function(location) {
    self.locations.push(location);
  };
  // Clear all locations from observable array
  self.clearLocations = function() {
    self.locations.removeAll();
  };
  // Remove all locations and map markers
  self.clearLocationsAndMarkers = function() {
    self.clearLocations();
    clearMarkers();
  };
  // Perform a new search for locations
  self.newSearch = function(type) {
    getPlaceSearch(type.value);
  };
  // Perform yelp restaurant search
  self.yelpSearch = function(search, location) {
    var url = "http://localhost:5000/";
    $.getJSON( url, {
      search: 'restaurants',
      location: 'playa vista'
    }, function( data ) {
      console.log(data);
      self.clearLocationsAndMarkers();
      for (var i = 0; i < data.businesses.length; i++) {
        var businessData = data.businesses[i];
        var business = {
          name: businessData.name,
          position: {
            lat: businessData.coordinates.latitude,
            lng: businessData.coordinates.longitude
          }
        };
        self.locations.push(business);
        var marker = createMarker(business.position, business.name);
        markers.push(marker);
      }
      setMarkersMap(map);
    });
  };
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
