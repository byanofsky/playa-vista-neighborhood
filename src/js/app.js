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
  // Get eatlist from localStorage or create blank one
  self.eatlist = ko.observableArray();
  // Restaurant markers
  self.markers = [];
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
  self.defaultCategory = self.categories()[0];
  self.activeCategory = ko.observable();
  // Track distance/radius filter data
  self.radiusFilters = ko.observableArray([
    { value: 1609, label: '1 Mile'},
    { value: 3218, label: '2 Miles'},
    { value: 4828, label: '3 Miles'}
  ]);
  self.defaultRadiusFilter = self.radiusFilters()[0];
  self.activeRadiusFilter = ko.observable();
  // Track what data is loading. Defaults to true.
  self.mapLoading = ko.observable(true); // Google maps data
  self.restaurantsLoading = ko.observable(true); // Restaurant data
  // Track if any data loading
  self.dataLoading = ko.computed(function() {
    return self.mapLoading() || self.restaurantsLoading();
  });
  // Track if offcanvas list should be visible or not.
  // If window width is greater than 768px, show by default.
  self.offcanvasActive = ko.observable($(window).width() >= 768);
  // Track if retry search should show
  self.retrySearchStatus = ko.observable(false);

  // Behaviors
  // Perform yelp search, using `activeCategory` and `activeRadiusFilter`
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
      // Turn off restaurant data loading observable
      self.restaurantsLoading(false);
    }).fail(function(data) {
      // TODO: what happens on fail. revert back
      console.log('Something went wrong on server: ' + data.responseText);
      // If there was an issue with data load, turn data laoding off
      if (self.dataLoading()) self.restaurantsLoading(false);
      self.retrySearchStatus(true);
    });
  };
  // Change what search results are shown
  self.search = function() {
    // Perform yelp search
    self.yelpRestaurantSearch();
  };
  // Attempt to search again if it failed
  self.retrySearch = function() {
    self.retrySearchStatus(false);
    self.search();
  };
  // Display all locations. Set active category to default
  // and perform new search
  self.showAllCategories = function() {
    // Set active search to default category
    self.activeCategory(self.defaultCategory);
    self.search();
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
};

var viewModelInstance = new ViewModel();
viewModelInstance.init();

ko.applyBindings(viewModelInstance);
