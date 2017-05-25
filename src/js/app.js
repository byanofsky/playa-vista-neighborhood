// Set location center
var locationCenter = {lat: 33.9739136, lng: -118.4161883};
// Set backend server url to make calls to yelp api
var yelpApiUrl = "http://localhost:5000/";

var ViewModel = function() {
  var self = this;

  // Initialize ViewModel
  self.init = function() {
    // Load eatlist from localStorage
    self.loadEatlist();
    // Load options from localStorage
    self.loadOptions();
    // Perform initial search
    self.search();
  };

  // Track restaurant data
  self.restaurants = ko.observableArray();
  // Restaurant map markers
  self.markers = [];
  // Current active/selected restaurant
  self.activeRestaurant = ko.observable();
  // Track the user's eatlist
  self.eatlist = ko.observableArray();
  // Restaurant categories
  self.categories = ko.observableArray(
    [
      { value: 'restaurants', label: 'All Restaurants' },
      { value: 'italian', label: 'Italian' },
      { value: 'japanese', label: 'Japanese' },
      { value: 'pizza', label: 'Pizza' },
      { value: 'vegetarian', label: 'Vegetarian'}
    ]
  );
  // Default restaurant category
  self.defaultCategory = self.categories()[0];
  // Current active/selected category
  self.activeCategory = ko.observable();
  // Radius/distance filters
  self.radiusFilters = ko.observableArray([
    // Value in meters
    { value: 1609, label: '1 Mile'},
    { value: 3218, label: '2 Miles'},
    { value: 4828, label: '3 Miles'}
  ]);
  // Default radius/distance filter
  self.defaultRadiusFilter = self.radiusFilters()[0];
  // Current active/selected radius/distance filter
  self.activeRadiusFilter = ko.observable();
  // Track when data is loading.
  // `true` === loading, `false` === not loading.
  self.mapLoading = ko.observable(true); // Google maps data
  self.restaurantsLoading = ko.observable(true); // Yelp Restaurant data
  // Track if any data loading
  self.dataLoading = ko.computed(function() {
    return self.mapLoading() || self.restaurantsLoading();
  });
  // Track if offcanvas list should be visible or not.
  // If window width is greater than 768px, show by default.
  self.offcanvasActive = ko.observable($(window).width() >= 768);
  // Track if retry search window should show.
  // Will be true if yelp api data load fails.
  self.retrySearchStatus = ko.observable(false);

  // Perform a yelp restaurant search, using activeCategory
  // and activeRadiusFilter as input
  self.search = function() {
    var category = self.activeCategory().value;
    var radiusFilter = self.activeRadiusFilter().value;
    // Perform yelp search
    yelpRestaurantSearch(category, radiusFilter);
  };
  // Attempt to search again if it failed
  self.retrySearch = function() {
    self.retrySearchStatus(false);
    self.search();
  };
  // Cancel search
  self.cancelSearch = function() {
    console.log('Cancel search');
    console.log(self.oldCategory, self.oldRadiusFilter);
    if (self.oldCategory) self.activeCategory(self.oldCategory);
    if (self.oldRadiusFilter) self.activeRadiusFilter(self.oldRadiusFilter);
    self.retrySearchStatus(false);
  };
  // Display all locations. Set active category to default
  // and perform new search
  self.showAllCategories = function() {
    // Set active search to default category
    self.activeCategory(self.defaultCategory);
    self.search();
  };
  // Store current options if needed again
  self.storeCurrentOptions = function() {
    console.log('Store current options');
    self.oldCategory = self.activeCategory();
    self.oldRadiusFilter = self.activeRadiusFilter();
    console.log(self.oldCategory, self.oldRadiusFilter);
  };
  // Filter by category. Set active category to category parameter, and perform
  // new search
  self.filterByCategory = function(category) {
    self.activeCategory(category);
    self.search();
  };
  // Filter by radius. Set active radius to radiusFilter parameter, and perform
  // new search
  self.filterByRadius = function(radiusFilter) {
    self.activeRadiusFilter(radiusFilter);
    self.search();
  };
  // Filter results shown to only those on the eatlist
  self.filterEatlist = function() {
    console.log('eatlist triggered');
  };
  // Cycle through restaurants and create markers
  self.createMarkers = function() {
    self.restaurants().forEach(function(restaurant) {
      var marker = createMarker(restaurant);
      // Create a marker, and assign to restaurant
      self.markers.push(marker);
      restaurant.marker = marker;
    });
  };
  // Display markers on google map
  self.displayAllMarkers = function() {
    // Remove the existing markers
    self.removeAllMarkers();
    map.setCenter(locationCenter); // Center map to default location
    // Create markers from restaurant list
    self.createMarkers();
    self.markers.forEach(function(marker) {
      marker.setMap(map);
    });
    // Adjust map bounds to fit all markers
    fitRestaurantMarkers(self.restaurants());
  };
  // Listen when dataLoading tracker switches to false and fire map markers.
  // When dataLoading goes from true to false, data has just completed loading
  // from map and restaurant data calls.
  self.dataLoading.subscribe(function(newValue) {
    if (newValue === false) {
      console.log('Map and restaurant data has completed loading.');
      console.log('Mapping markers.');
      self.displayAllMarkers();
    }
  });
  // Remove all markers from google map
  self.removeAllMarkers = function() {
    self.markers.forEach(function(marker) {
      marker.setMap(null);
    });
    self.markers = [];
  };
  // Map yelp business data into a restaurant object, and return restaurant
  // object to use internally
  self.mapYelp2Local = function(business) {
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
      review_count: business.review_count,
      phone: business.phone,
      // Check if restaurant on eatlist
      eatlistState: ko.observable(self.eatlist.indexOf(business.id) !== -1)
    };
    restaurant.eatlistState.subscribe(function() {
      console.log('Eatlist state changed');
      // Save eatlist to local storage
      self.saveEatlist();
    });
    return restaurant;
  };
  // Toggle active class on list items
  self.selectListRestaurant = function(restaurant) {
    self.activeRestaurant(restaurant);
    selectMarker(restaurant.marker, restaurant);
  };
  // Toggle offcanvas restaurant list
  self.toggleOffcanvas = function() {
    self.offcanvasActive(! self.offcanvasActive());
    // Check if Google maps API has loaded
    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
      // Trigger resize for map since #map-container changes size
      google.maps.event.trigger(map, 'resize');
    }
  };
  // Toggle restaurant on eatlist
  self.toggleEatlist = function() {
    // Get opposite of current state
    var newVal = ! this.eatlistState();
    // TODO: what if value there twice? Maybe need an object instead
    // If value is positive, needs to be added to list.
    // Otherwise, remove from list
    if (newVal) {
      self.eatlist.push(this.id);
    } else {
      self.eatlist.remove(this.id);
    }
    this.eatlistState(newVal);
  };
  // Save eatlist to localStorage
  self.saveEatlist = function() {
    localStorage.eatlist = JSON.stringify(self.eatlist());
    console.log('Eatlist saved to localStorage');
  };
  // Load eatlist from localStorage
  self.loadEatlist = function() {
    // Load eatlist if it exists in local storage, or initialize empty array
    // TODO: should not be hasownproperty, but not undefined
    self.eatlist(localStorage.hasOwnProperty('eatlist') ?
      JSON.parse(localStorage.eatlist) : []);
  };
  // Load options data from localStorage
  self.loadOptions = function() {
    self.activeCategory(localStorage.activeCategory ? JSON.parse(localStorage.activeCategory) : self.defaultCategory);
    self.activeRadiusFilter(localStorage.activeRadiusFilter ? JSON.parse(localStorage.activeRadiusFilter) : self.defaultRadiusFilter);
  };
  // When change active category, save it to localStorage
  self.activeCategory.subscribe(function() {
    localStorage.activeCategory = JSON.stringify(self.activeCategory());
  });
  // When change active radius filter, save it to localStorage
  self.activeRadiusFilter.subscribe(function() {
    localStorage.activeRadiusFilter = JSON.stringify(self.activeRadiusFilter());
  });


  // Perform yelp search, with category and radiusFilter parameters
  var yelpRestaurantSearch = function(category, radiusFilter) {
    // Parameters for Yelp search
    var searchParams = {
      categories: category,
      latitude: locationCenter.lat,
      longitude: locationCenter.lng,
      limit: 50, // Limit results shown
      radius: radiusFilter,
      sort_by: 'rating' // Show highest rated first
    };
    // Set restaurants data loading observable to `true`
    self.restaurantsLoading(true);
    // JSON call to Yelp api middleman server
    $.getJSON( yelpApiUrl, searchParams)
      .done(searchSuccessHandler)
      .fail(searchFailHandler)
      .always(function() {
        // Turn off restaurants data loading, whether failed or not
        self.restaurantsLoading(false);
    });
  };
  // Runs on yelp api search success
  var searchSuccessHandler = function(data) {
    // Remove current current restaurant data
    self.restaurants.removeAll();
    // Map needed data to an object
    // TODO: might be able to use `map` here instead
    data.businesses.forEach(function(business) {
      // Check if business is within distance, otherwise skip.
      // Reasoning: https://github.com/Yelp/yelp-api/issues/95
      if (business.distance > self.activeRadiusFilter().value) {
        return;
      }
      // Turn yelp data into an internal restaurant object
      var restaurant = self.mapYelp2Local(business);
      // Add new restaurant to `restaurants` observable array
      self.restaurants.push(restaurant);
    });
  };
  // Runs when yelp api search fails
  var searchFailHandler = function(data) {
    // TODO: what happens on fail. revert back
    console.log('Something went wrong on server: ' + data.responseText);
    self.retrySearchStatus(true);
  };
};

var viewModelInstance = new ViewModel();
viewModelInstance.init();

ko.applyBindings(viewModelInstance);
