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
  // Perform a new search for locations
  self.newSearch = function(type) {
    getPlaceSearch(type.value);
  };
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
