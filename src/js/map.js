// Declare variables to reference outside initMap
// Google map
var map;
// TODO: remove
// All map markers
var markers = [];
// Google API Services
var geocoder;
var placesService;
// Google maps info window
var infowindow;

// Set Playa Vista center
var playaVistaCenter = {lat: 33.9739136, lng: -118.4161883};

function initMap() {
  // Create a map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: playaVistaCenter,
    scrollwheel: true,
    zoom: 15,
    mapTypeControlOptions: {
      mapTypeIds: ['styled_map', 'roadmap']
    }
  });

  // TODO: remove map style
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
  // Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  // Initialize geocoder service
  geocoder = new google.maps.Geocoder();
  // Initialize places service
  placesService = new google.maps.places.PlacesService(map);
  // Initialize infowinfow
  infowindow = new google.maps.InfoWindow();

  // Toogle off canvas list once map has loaded
  google.maps.event.addListenerOnce(map, 'idle', function() {
    // Show offcanvas menu by default when window >= 768
    if ($(window).width() >= 768) {
      toggleOffcanvas();
    }
  });
}

// Creates a default marker for map
function createMarker(position, title) {
  var marker = new google.maps.Marker({
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

// Adjust map bounds to fit all location markers
function fitLocationMarkers(locations) {
  var bounds = new google.maps.LatLngBounds();
  locations.forEach(function(location) {
    bounds.extend(location.position);
  });
  map.fitBounds(bounds);
}

// When marker focused on (ie, click from list item), open info window
function focusMarker(marker, content) {
  openInfoWindow(marker, content);
}

// Open infowindow on marker with defined content
function openInfoWindow(marker, content) {
  infowindow.setContent(content);
  infowindow.open(map, marker);
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
