var ViewModel = function() {
  var self = this;

  self.locations = ko.observableArray();
  self.activeLocation = ko.observable();
  self.types = ko.observableArray(
    [
      { value: 'italian', label: 'Italian' },
      { value: 'japanese', label: 'Japanese' },
      { value: 'pizza', label: 'Pizza' }
    ]
  );

  // Behaviors
  // Perform yelp search, using search `categories` and `location`
  self.yelpSearch = function(categories, location) {
    // Internal URL to return results from search
    var url = "http://localhost:5000/";
    $.getJSON( url, {
      categories: categories,
      location: location,
      radius: '4000' // 4000 meters ~= 3 miles
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
      self.displayAllMarkers();
    });
  };
  // Action for when a filter is selected
  self.filter = function(data) {
    self.removeAllMarkers();
    self.locations.removeAll();
    map.setCenter(playaVistaCenter);
    self.yelpSearch(data.value, 'playa vista');
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
    focusMarker(location.marker, location.name);
  };

  // Load initial data
  self.yelpSearch('restaurants', 'playa vista');
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
