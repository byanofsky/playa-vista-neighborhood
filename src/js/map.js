var locations = [
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

function initMap() {
  // Store all markers in this array
  var markers = [];

  // Initialize geocoding service
  var geocoder = new google.maps.Geocoder();

  // Map style from https://snazzymaps.com/style/27/shift-worker
  var styledMapType = new google.maps.StyledMapType(
    [
      {
        "stylers": [
          {
            "saturation": -100
          },
          {
            "gamma": 1
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.place_of_worship",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "simplified"
          }
        ]
      },
      {
        "featureType": "water",
        "stylers": [
          {
            "visibility": "on"
          },
          {
            "saturation": 50
          },
          {
            "gamma": 0
          },
          {
            "hue": "#50a5d1"
          }
        ]
      },
      {
        "featureType": "administrative.neighborhood",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#333333"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
          {
            "weight": 0.5
          },
          {
            "color": "#333333"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "labels.icon",
        "stylers": [
          {
            "gamma": 1
          },
          {
            "saturation": 50
          }
        ]
      }
    ], {name: 'Styled Map'});

  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.972536, lng: -118.426561},
    scrollwheel: false,
    zoom: 15,
    mapTypeControlOptions: {
        mapTypeIds: ['styled_map', 'roadmap']
      }
  });

  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  // Cycle through location addresses and create markers on map
  for (var i = 0; i < locations.length; i++) {
    geocodeAddressToMarker(locations[i], map, geocoder, markers);
  }
}

// Turns a location into a location using geocode service, and creates marker
function geocodeAddressToMarker(location, map, geocoder, markers) {
  geocoder.geocode({
    address: location.address
  }, function(results, status) {
    if (status === 'OK') {
      markers.push(createMarker(results[0].geometry.location, map, location.name));
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// Creates a default marker for map
function createMarker(position, map, title) {
  var marker = new google.maps.Marker({
    map: map,
    position: position,
    title: title,
    animation: google.maps.Animation.DROP
  });
  return marker;
}
