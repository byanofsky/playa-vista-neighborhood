var ViewModel = function() {
  var self = this;

  self.locations = ko.observableArray();
  self.activeLocation = ko.observable();
  // Track which items are being shown
  self.activeSearch = ko.observable('restaurants');
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
      limit: 5,
      radius: '4000' // 4000 meters ~= 3 miles
    }, function( data ) {
      console.log(data);
      // Map needed data to an object
      data.businesses.forEach(function(business) {
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
    });
  };
  // Change what search results are shown
  self.newSearch = function(category) {
    // Only run is this is a new search (not same as active search)
    if (self.activeSearch() !== category) {
      // Set active search to category
      self.activeSearch(category);
      // Reset markers, locations, and map to default
      self.removeAllMarkers();
      self.locations.removeAll();
      map.setCenter(playaVistaCenter);
      // Perform yelp search
      self.yelpSearch(category, 'playa vista');
    }
  };
  // Display all locations
  self.filterAll = function() {
    self.newSearch('restaurants');
  };
  // Action for when a filter is selected
  self.filter = function(data) {
    // Category is the value of the element
    self.newSearch(data.value);
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
