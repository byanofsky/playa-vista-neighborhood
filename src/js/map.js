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

function initMap() {
  // Create a map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: playaVistaCenter,
    scrollwheel: true,
    zoom: 15,
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['styled_map', 'roadmap']
    }
  });

  // TODO: remove map style
  // Map style from https://snazzymaps.com/style/27/shift-worker
  var styledMapType = new google.maps.StyledMapType(
    [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#bdbdbd"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dadada"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#c9c9c9"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
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
      // Adjust bounds to account for offcanvas list
      fitLocationMarkers(viewModelInstance.locations());
    }
    // Map is done loading
    viewModelInstance.mapLoading(false);
  });
}

// Creates a default marker for map
function createMarker(position, location) {
  var marker = new google.maps.Marker({
    position: position,
    title: location.name,
    animation: google.maps.Animation.DROP,
    location: location
  });
  // Add listener to fire actions when marker selected
  marker.addListener('click', function() {
    selectMarker(marker, location);
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
function selectMarker(marker, business) {
  openInfoWindow(marker, business);
}

// Open infowindow on marker with defined content
function openInfoWindow(marker, business) {
  populateInfoWindow(business);
  infowindow.open(map, marker);
}

// Populate info window with business information
function populateInfoWindow(business) {
  console.log(business);
  var content = '';
  content += '<h5>' + business.name + '</h5>';
  if (business.location.display_address) {
    content += '<p>';
    content += business.location.display_address.join(', ');
    content += '</p>';
  }
  content += '<img src="img/' + business.star_img + '">';
  content += '<p>Based On ' + business.review_count + ' ' + (business.review_count === 1 ? 'Review' : 'Reviews') + '</p>';
  infowindow.setContent(content);
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
