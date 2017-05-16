// Set Playa Vista center
var playaVistaCenter = {lat: 33.9739136, lng: -118.4161883};

function hideLoader() {
  $('#loading-spinner').hide();
}

function showLoader() {
  $('#loading-spinner').show();
}

var ViewModel = function() {
  var self = this;

  self.locations = ko.observableArray();
  self.activeLocation = ko.observable();
  self.defaultType = { value: 'restaurants', label: 'All Restaurants' };
  self.types = ko.observableArray(
    [
      { value: 'italian', label: 'Italian' },
      { value: 'japanese', label: 'Japanese' },
      { value: 'pizza', label: 'Pizza' }
    ]
  );
  // Track which items are being shown
  self.activeSearch = ko.observable(self.defaultType);
  self.radiusFilters = ko.observableArray([
    { value: 1609, label: '1 Mile'},
    { value: 3218, label: '2 Miles'},
    { value: 4828, label: '3 Miles'}
  ]);
  self.activeRadiusFilter = ko.observable(self.radiusFilters()[0]);

  // Behaviors
  // Perform yelp search, using search `categories` and `location`
  self.yelpSearch = function() {
    showLoader();
    // Internal URL to return results from search
    var url = "http://localhost:5000/";
    $.getJSON( url, {
      categories: self.activeSearch().value,
      latitude: playaVistaCenter.lat,
      longitude: playaVistaCenter.lng,
      limit: 50,
      radius: self.activeRadiusFilter().value,
      sort_by: 'rating' // Show highest rated
    }, function( data ) {
      console.log(data);
      // Map needed data to an object
      data.businesses.forEach(function(business) {
        // Check if business is within distance, otherwise return to skip.
        // Reasoning: https://github.com/Yelp/yelp-api/issues/95
        if (business.distance > self.activeRadiusFilter().value) {
          return;
        }
        var location = {
          id: business.id,
          name: business.name,
          url: business.url,
          // Store position in a format usable by google maps
          position: {
            lat: business.coordinates.latitude,
            lng: business.coordinates.longitude
          },
          location: business.location,
          price: business.price,
          categories: business.categories,
          rating: business.rating,
          phone: business.phone
        };
        // Create a marker for this location, and assign to location
        location.marker = createMarker(location.position, location);
        // Push marker to markers array within map
        markers.push(location.marker);
        // Add new location to `locations` observable array
        self.locations.push(location);
      });
      self.displayAllMarkers();
      fitLocationMarkers(self.locations());
      hideLoader();
    });
  };
  // Change what search results are shown
  self.newSearch = function(category) {
    // Reset markers, locations, and map to default
    self.removeAllMarkers();
    self.locations.removeAll();
    map.setCenter(playaVistaCenter);
    // Perform yelp search
    self.yelpSearch();
  };
  // Display all locations
  self.filterAll = function() {
    // Set active search to category
    self.activeSearch(self.defaultType);
    self.newSearch();
  };
  // Action for when a filter is selected
  self.filter = function(data) {
    self.activeSearch(data);
    // Category is the value of the element
    self.newSearch();
  };
  self.filterByRadius = function(data) {
    self.activeRadiusFilter(data);
    self.newSearch();
  };
  // Get and show categories
  self.showCategories = function() {
    // Internal URL to return results from search
    var url = "http://localhost:5000/categories/";
    $.getJSON( url, {
      categories: 'restaurants',
      location: 'playa vista',
      radius: '4000' // 4000 meters ~= 3 miles
    }, function( data ) {
      console.log(data);
    });
  };
  // Display markers on google map
  self.displayAllMarkers = function() {
    self.locations().forEach(function(location) {
      location.marker.setMap(map);
    });
  };
  // Remove all markers from google map
  self.removeAllMarkers = function() {
    self.locations().forEach(function(location) {
      location.marker.setMap(null);
    });
  };
  // Toggle active class on list items
  self.selectListItem = function(location) {
    self.activeLocation(location);
    selectMarker(location.marker, location);
  };

  // Load initial data
  self.yelpSearch('restaurants', 'playa vista');
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
