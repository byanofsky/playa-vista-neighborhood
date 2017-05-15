var ViewModel = function() {
  var self = this;

  self.locations = ko.observableArray();
  self.activeLocation = ko.observable();
  // Track which items are being shown
  self.activeSearch = ko.observable('all');
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
  // Display all locations
  self.displayAllItems = function() {
    // If already showing item category, don't run again
    if (self.activeSearch() !== 'all') {
      self.removeAllMarkers();
      self.locations.removeAll();
      map.setCenter(playaVistaCenter);
      self.yelpSearch('restaurants', 'playa vista');
      self.activeSearch('all');
    }
  };
  // Action for when a filter is selected
  self.filter = function(data) {
    if (self.activeSearch() !== data.value) {
      self.removeAllMarkers();
      self.locations.removeAll();
      map.setCenter(playaVistaCenter);
      self.yelpSearch(data.value, 'playa vista');
      self.activeSearch(data.value);
    }
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
