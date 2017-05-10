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

// Initialize map
var map;
// Store all markers in this array
var markers = [];
// Initialize geocoding service
var geocoder;
// Initialize places service
var placesService;
// Declare info window
var infowindow;

function initMap() {
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
  map = new google.maps.Map(document.getElementById('map'), {
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

  // Initialize geocoder service
  geocoder = new google.maps.Geocoder();
  // Initialize places service
  placesService = new google.maps.places.PlacesService(map);
  // Initialize infowinfow
  infowindow = new google.maps.InfoWindow();

  getPlaceSearch();
}

// Creates a default marker for map
function createMarker(position, title) {
  var marker = new google.maps.Marker({
    map: map,
    position: position,
    title: title,
    animation: google.maps.Animation.DROP
  });
  // Add listener to fire actions when marker selected
  marker.addListener('click', function() {
    focusMarker(marker, title);
  });
  return marker;
}

// Performs a places search, centered on current map location
function getPlaceSearch(keyword) {
  placesService.nearbySearch({
    location: map.getCenter(),
    radius: 500,
  }, function(results, status) {
    if (status === 'OK') {
      results.forEach(function(result) {
        // Create a marker and push to markers array and attach to location
        var marker = createMarker(result.geometry.location, result.name);
        markers.push(marker);
        result.marker = marker;
        // Push each result to locations observable array
        viewModelInstance.locations.push(result);
      });
    } else {
      alert('Place Search was not successful for the following reason: ' + status);
    }
  });
}

// Open info window and bounce marker
function focusMarker(marker, content) {
  openInfoWindow(marker, content);
  markerBounce(marker);
}

// Open infowindow on marker with defined content
function openInfoWindow(marker, content) {
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

// Bounce marker once
function markerBounce(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  window.setTimeout(function() {
    marker.setAnimation(null);
  }, 750);
}

// Turns a location into a location using geocode service, and creates marker
// function geocodeAddressToMarker(location, map, geocoder, markers) {
//   geocoder.geocode({
//     address: location.address
//   }, function(results, status) {
//     if (status === 'OK') {
//       markers.push(createMarker(results[0].geometry.location, map, location.name));
//     } else {
//       alert('Geocode was not successful for the following reason: ' + status);
//     }
//   });
// }
