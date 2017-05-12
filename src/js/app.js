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
  // Perform yelp search, using search `term` and `location`
  self.yelpSearch = function(term, location) {
    // Internal URL to return results from search
    var url = "http://localhost:5000/";
    $.getJSON( url, {
      term: term,
      location: location
    }, function( data ) {
      // Map needed data to an object
      data.businesses.forEach(function(business) {
        var location = {
          name: business.name,
          // Store position in a format usable by google maps
          position: {
            lat: business.coordinates.latitude,
            lng: business.coordinates.longitude
          },
          location: business.location,
          price: business.price,
          categoies: business.categories,
          rating: business.rating
        };
        // Create a marker for this location, and assign to location
        location.marker = createMarker(location.position, location.name);
        // Push marker to markers array within map
        markers.push(location.marker);
        // Add new location to `locations` observable array
        self.locations.push(location);
      });
      self.displayMarkers();
    });
  };
  // Display markers on google map
  self.displayMarkers = function() {
    setMarkersMap(map);
  };
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
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);

viewModelInstance.yelpSearch('restaurants', 'playa vista');
