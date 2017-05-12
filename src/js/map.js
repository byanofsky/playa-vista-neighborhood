// Declare map so it can be referenced
var map;
// Store all markers in this array
var markers = [];
// Declare google api services so they can be referenced
var geocoder;
var placesService;
// Declare info window, so only one is used at a time
var infowindow;

function initMap() {
  // Create a map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.9739136, lng: -118.4161883},
    scrollwheel: true,
    zoom: 15,
    mapTypeControlOptions: {
        mapTypeIds: ['styled_map', 'roadmap']
      }
  });

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

  // Once map has loaded, perform initial search.
  // 'idle' event thanks to: http://stackoverflow.com/a/2833067
  google.maps.event.addListenerOnce(map, 'idle', function() {
    createAndShowMarkers(viewModelInstance.locations());
  });
}

// Create markers and display them on the map from a set of locations
function createAndShowMarkers(locations) {
  console.dir(locations);
  locations.forEach(function(location) {
    var marker = createMarker(location.position, location.title);
    console.log(marker);
    marker.setMap(map);
    markers.push(marker);
  });
}

// Performs a places search, centered on current map location
function getPlaceSearch(locationType) {
  placesService.nearbySearch({
    location: map.getCenter(),
    radius: 1000,
    type: locationType,
    rankBy: google.maps.places.RankBy.PROMINENCE
  }, function(locations, status) {
    if (status === 'OK') {
      // Clear existing markers from map, if any
      clearMarkers();
      viewModelInstance.clearLocations();
      locations.forEach(function(location) {
        // Create a marker for this location
        var marker = createMarker(location.geometry.location, location.name);
        // Add marker to markers array
        markers.push(marker);
        // Add marker as property to location
        location.marker = marker;
        // Add location to locations observable array
        viewModelInstance.addLocation(location);
      });
      setMarkersMap(map);
    } else {
      alert('Place Search was not successful for the following reason: ' + status);
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

// Open info window and bounce marker
function focusMarker(marker, content) {
  openInfoWindow(marker, content);
}

// Clear markers
function clearMarkers() {
  if (markers) {
    setMarkersMap(null);
    markers = [];
  }
}

// Set map for all markers
function setMarkersMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
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
