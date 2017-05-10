var locationsOld = [
  {
    name: 'YouTube Spaces',
    address: '12422 Bluff Creek Dr, Los Angeles, CA 90094'
  },
  {
    name: 'Fullscreen, Inc.',
    address: '12180 Millennium Dr, Los Angeles, CA 90094'
  },
  {
    name: 'IMAX Post/DKP Inc.',
    address: '12582 Millennium Dr, Playa Vista, CA 90094'
  },
  {
    name: 'Belkin International',
    address: '12045 Waterfront Dr, Los Angeles, CA 90094'
  },
  {
    name: 'Yahoo Inc, Playa Vista. Office',
    address: '11975 Bluff Creek Dr, Los Angeles, CA 90094'
  },
  {
    name: 'Electronic Arts (EA)',
    address: '5510 Lincoln Blvd, Playa Vista, CA 90094'
  },
  {
    name: 'ICANN',
    address: '12025 E Waterfront Dr #300, Los Angeles, CA 90094'
  }
];

var ViewModel = function() {
  var self = this;
  self.locations = ko.observableArray();
  self.selectedLocation = ko.observable();
  self.types = ko.observableArray(
    [
      {
        value: 'restaurant',
        label: 'Restaurants'
      },
      {
        value: 'bar',
        label: 'Bars'
      },
      {
        value: 'cafe',
        label: 'Cafes'
      }
    ]
  );

  // Behaviors

  // Toggle active class on list items
  self.toggleActive = function(data, event) {
    if (self.selectedLocation()) {
      $(self.selectedLocation()).toggleClass('active');
    }
    self.selectedLocation(event.target);
    $(event.target).toggleClass('active');
    focusMarker(data.marker, data.name);
  };
  // Perform a new search for locations
  self.newSearch = function(data, event) {
    var type = data.value;
    getPlaceSearch(type);
  };
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
