// Set location center
var locationCenter = {lat: 33.9739136, lng: -118.4161883};
// Set backend server url to make calls to yelp api
var yelpApiUrl = "http://localhost:5000/";

var ViewModel = function() {
  var self = this;
  // Track restaurant data
  self.restaurants = ko.observableArray();
  self.activeRestaurant = ko.observable();
  // Track restaurant category data
  self.categories = ko.observableArray(
    [
      { value: 'restaurants', label: 'All Restaurants' },
      { value: 'italian', label: 'Italian' },
      { value: 'japanese', label: 'Japanese' },
      { value: 'pizza', label: 'Pizza' },
      { value: 'vegetarian', label: 'Vegetarian'}
    ]
  );
  self.defaultCategory = ko.observable(self.categories()[0]);
  self.activeCategory = ko.observable(self.defaultCategory());
  // Track distance/radius filter data
  self.radiusFilters = ko.observableArray([
    { value: 1609, label: '1 Mile'},
    { value: 3218, label: '2 Miles'},
    { value: 4828, label: '3 Miles'}
  ]);
  self.activeRadiusFilter = ko.observable(self.radiusFilters()[0]);
  // Track what data is loading. Defaults to true.
  self.mapLoading = ko.observable(true); // Google maps data
  self.restaurantsLoading = ko.observable(true); // Restaurant data
  // Track if any data loading
  self.dataLoading = ko.computed(function() {
    return self.mapLoading() || self.restaurantsLoading();
  });

  // Behaviors
  // Perform yelp search, using search `categories` and `location`
  self.yelpRestaurantSearch = function() {
    // Set restaurants data loading observable to `true`
    self.restaurantsLoading(true);
    $.getJSON( yelpApiUrl, {
      categories: self.activeCategory().value,
      latitude: locationCenter.lat,
      longitude: locationCenter.lng,
      limit: 50, // Limit results shown
      radius: self.activeRadiusFilter().value,
      sort_by: 'rating' // Show highest rated first
    }, function( data ) {
      // Reset markers, locations, and map to default
      self.removeAllMarkers();
      self.restaurants.removeAll();
      map.setCenter(locationCenter);
      // Map needed data to an object
      // TODO: might be able to use `map` here instead
      data.businesses.forEach(function(business) {
        // Check if business is within distance, otherwise skip.
        // Reasoning: https://github.com/Yelp/yelp-api/issues/95
        if (business.distance > self.activeRadiusFilter().value) {
          return;
        }
        var restaurant = {
          id: business.id,
          name: business.name,
          url: business.url,
          // Store position in lat/lng format usable by google maps
          position: {
            lat: business.coordinates.latitude,
            lng: business.coordinates.longitude
          },
          location: business.location,
          price: business.price,
          categories: business.categories,
          rating: business.rating,
          star_img: self.getYelpStarIMG(business.rating),
          review_count: business.review_count,
          phone: business.phone
        };
        // Create a marker, and assign to restaurant
        restaurant.marker = createMarker(restaurant.position, restaurant);
        // Add new restaurant to `restaurants` observable array
        self.restaurants.push(restaurant);
      });
      self.displayAllMarkers();
      fitLocationMarkers(self.restaurants());
      // Turn off restaurant data loading observable
      self.restaurantsLoading(false);
    }).fail(function(data) {
      console.log('Something went wrong on server: ' + data.responseText);
      // If there was an issue with data load, turn data laoding off
      if (self.dataLoading()) self.dataLoading(false);
      window.alert('There was an issue loading data');
    });
  };
  // Change what search results are shown
  self.search = function() {
    // Perform yelp search
    self.yelpRestaurantSearch();
  };
  // Display all locations
  self.showAllCategories = function() {
    // Set active search to category
    self.activeCategory(self.defaultCategory);
    self.search();
  };
  // Action for when a filter is selected
  self.filterByCategory = function(category) {
    self.activeCategory(category);
    // Category is the value of the element
    self.search();
  };
  self.filterByRadius = function(data) {
    self.activeRadiusFilter(data);
    self.search();
  };
  // Display markers on google map
  self.displayAllMarkers = function() {
    self.restaurants().forEach(function(restaurant) {
      restaurant.marker.setMap(map);
    });
  };
  // Remove all markers from google map
  self.removeAllMarkers = function() {
    self.restaurants().forEach(function(restaurant) {
      restaurant.marker.setMap(null);
    });
  };
  // Toggle active class on list items
  self.selectListRestaurant = function(restaurant) {
    self.activeRestaurant(restaurant);
    selectMarker(restaurant.marker, restaurant);
  };
  // Get yelp star image according to rating
  self.getYelpStarIMG = function(rating) {
    return 'small_' + String(rating).replace('.5', '_half');
  };
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
