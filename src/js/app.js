// Class for restaurants, takes yelp business data as input
var Restaurant = function(data) {
  // Map yelp business data into a restaurant object
  this.id = data.id;
  this.name = data.name;
  this.url = data.url;
  // Store position in lat/lng format usable by google maps
  this.position = {
    lat: data.coordinates.latitude,
    lng: data.coordinates.longitude
  };
  this.location = data.location;
  this.price = data.price;
  this.categories = data.categories;
  this.rating = data.rating;
  this.review_count = data.review_count;
  this.phone = data.phone;
};

var ViewModel = function() {
  var self = this;

  // Initialize ViewModel
  self.init = function() {
    // Load eatlist from localStorage
    loadEatlist();
    // Load options from localStorage
    loadOptions();
    // Perform initial search
    self.search();
  };

  // Data
  // Track restaurant data
  self.restaurants = ko.observableArray();
  // Track active map marker
  self.activeMarker = null;
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
  // Favorite filters
  self.filters = ko.observableArray([
    { value: 'all', label: 'All'},
    { value: 'eatlist', label: 'Favorited'},
    { value: 'notEatlist', label: 'Not Favorited'}
  ]);
  // Set default filter to 'all'
  self.activeFilter = ko.observable(self.filters()[0]);
  // Show all restaurants, or filtered, depending on active filter.
  // Help from: http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  self.filteredRestaurants = ko.computed(function() {
    // Get value of current filter
    var filter = self.activeFilter().value;
    if (filter === 'all') {
      // If filter `all`, show all restaurants
      return self.restaurants();
    } else {
      // If a filter is specified, either show `eatlist` === `true` restaurants,
      // or show with `false`
      return ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
        return filter === 'eatlist' ? restaurant.eatlistState() : ! restaurant.eatlistState();
      });
    }
  });
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

  // Behavior
  // Perform a yelp restaurant search, using activeCategory
  // and activeRadiusFilter as input
  self.search = function() {
    var category = self.activeCategory().value;
    var radiusFilter = self.activeRadiusFilter().value;
    // Perform yelp search
    yelpRestaurantSearch(category, radiusFilter);
  };
  // Retry search function, specifically for use when a search fails
  self.retrySearch = function() {
    // Set retry search status to false. Was turned to true when search failed.
    self.retrySearchStatus(false);
    self.search();
  };
  // Cancel search functions, specifically for use when a search fails
  self.cancelSearch = function() {
    console.log('Cancel search');
    console.log(self.oldCategory, self.oldRadiusFilter);
    if (self.oldCategory) self.activeCategory(self.oldCategory);
    if (self.oldRadiusFilter) self.activeRadiusFilter(self.oldRadiusFilter);
    self.retrySearchStatus(false);
    // TODO: revert conditions back to before search failed
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
  self.filterEatlist = function(filter) {
    self.activeFilter(filter);
  };
  // Toggle active class on list items
  self.selectListRestaurant = function(restaurant) {
    self.activeRestaurant(restaurant);
  };
  // Toggle offcanvas restaurant list
  self.toggleOffcanvas = function() {
    self.offcanvasActive(! self.offcanvasActive());
    // Check if Google maps API has loaded
    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
      // Trigger resize for map since #map-container changes size
      google.maps.event.trigger(mapInstance.map, 'resize');
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

  // Subscriptions
  // When change active category, save it to localStorage
  self.activeCategory.subscribe(function() {
    localStorage.activeCategory = JSON.stringify(self.activeCategory());
  });
  // When change active radius filter, save it to localStorage
  self.activeRadiusFilter.subscribe(function() {
    localStorage.activeRadiusFilter = JSON.stringify(self.activeRadiusFilter());
  });
  // When active restaurant changed, update map
  self.activeRestaurant.subscribe(function(newRestaurant) {
    mapInstance.selectMarker(newRestaurant.marker, newRestaurant);
  });
  // When active filter changes, update map markers
  self.activeFilter.subscribe(function() {
    // Hide all current map markers
    hideAllMarkers();
    // Display only filtered markers
    displayMarkers();
  });
  // Listen when dataLoading tracker switches to false and fire map markers.
  // When dataLoading goes from true to false, data has just completed loading
  // from map and restaurant data calls.
  // This is because these functions require google maps api & restaurant data
  // to be loaded.
  self.dataLoading.subscribe(function(newValue) {
    if (newValue === false) {
      console.log('Map and restaurant data has completed loading.');
      console.log('Mapping markers.');
      resetMarkers();
    }
  });

  // Perform yelp search, with category and radiusFilter parameters
  var yelpRestaurantSearch = function(category, radiusFilter) {
    // Parameters for Yelp search
    var searchParams = {
      categories: category,
      latitude: config.locationCenter.lat,
      longitude: config.locationCenter.lng,
      limit: 50, // Limit results shown
      radius: radiusFilter,
      sort_by: 'rating' // Show highest rated first
    };
    // Set restaurants data loading observable to `true`
    self.restaurantsLoading(true);
    // JSON call to Yelp api middleman server
    $.getJSON( config.yelpApiUrl, searchParams)
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
    // Create new restaurants from yelp data
    data.businesses.forEach(function(business) {
      // Check if business is within distance, otherwise skip.
      // Reasoning: https://github.com/Yelp/yelp-api/issues/95
      if (business.distance > self.activeRadiusFilter().value) {
        return;
      }
      // Construct new restaurant object
      var restaurant = new Restaurant(business);
      // TODO: this might be able to be added as computed ko on the object itself.
      // Set restaurant eatlist state (true if on eatlist)
      restaurant.eatlistState = ko.observable(self.eatlist.indexOf(business.id) !== -1);
      // TODO: this can be tracked when eatlist changes
      restaurant.eatlistState.subscribe(function() {
        console.log('Eatlist state changed');
        // Save eatlist to local storage
        saveEatlist();
      });
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
  // Delete all current markers when new restaurant data loaded,
  // create new markers, and show new markers.
  var resetMarkers = function() {
    removeAllMarkers();
    createAllMarkers();
    displayMarkers();
  };
  // Recenter map and display current map markers for filtered restaurants
  var displayMarkers = function() {
    // Center map to default location
    centerMap(config.locationCenter);
    // Adjust map bounds to fit all markers
    mapInstance.fitRestaurantMarkers(self.filteredRestaurants());
    // Show map markers
    showRestaurantMarkers(self.filteredRestaurants());
  };
  // Cycle through restaurants and create markers
  var createAllMarkers = function() {
    self.restaurants().forEach(function(restaurant) {
      var marker = mapInstance.createMarker(restaurant);
      // Create a marker, and assign to restaurant
      self.markers.push(marker);
      restaurant.marker = marker;
    });
  };
  // Cycle through restaurants and maker their markers visible
  var showRestaurantMarkers = function(restaurants) {
    restaurants.forEach(function(restaurant) {
      restaurant.marker.setMap(mapInstance.map);
    });
  };
  // Hide all markers from google map, but don't remove from markers array
  var hideAllMarkers = function() {
    self.markers.forEach(function(marker) {
      marker.setMap(null);
    });
  };
  // Remove all markers from google map.
  // Uses markers array in case restaurants have been deleted already.
  var removeAllMarkers = function() {
    hideAllMarkers();
    self.markers = [];
  };
  // Center map to latLng location
  var centerMap = function(latLng) {
    mapInstance.map.setCenter(latLng);
  };
  // Save eatlist to localStorage
  var saveEatlist = function() {
    localStorage.eatlist = JSON.stringify(self.eatlist());
    console.log('Eatlist saved to localStorage');
  };
  // Load eatlist from localStorage
  var loadEatlist = function() {
    // Load eatlist if it exists in local storage, or initialize empty array
    // TODO: should not be hasownproperty, but not undefined
    self.eatlist(localStorage.hasOwnProperty('eatlist') ?
      JSON.parse(localStorage.eatlist) : []);
  };
  // Load options data from localStorage
  var loadOptions = function() {
    self.activeCategory(localStorage.activeCategory ? JSON.parse(localStorage.activeCategory) : self.defaultCategory);
    self.activeRadiusFilter(localStorage.activeRadiusFilter ? JSON.parse(localStorage.activeRadiusFilter) : self.defaultRadiusFilter);
  };
};

var viewModelInstance = new ViewModel();
viewModelInstance.init();

ko.applyBindings(viewModelInstance);
