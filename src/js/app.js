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
  this.locations = ko.observableArray();
};

var viewModelInstance = new ViewModel();

ko.applyBindings(viewModelInstance);
