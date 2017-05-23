// Declare variables to reference outside initMap
// Google map
var map;
// Google maps info window
var infowindow;

function initMap() {
  // Create a map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: locationCenter,
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

  // Initialize infowinfow
  infowindow = new google.maps.InfoWindow();

  // Load initial restaurant data once google maps api loaded
  viewModelInstance.yelpRestaurantSearch();

  // Toogle off canvas list once map has loaded
  google.maps.event.addListenerOnce(map, 'idle', function() {
    // Map is done loading
    viewModelInstance.mapLoading(false);
  });
}

// Creates a marker for map
function createMarker(restaurant) {
  var marker = new google.maps.Marker({
    position: restaurant.position,
    title: restaurant.name,
    animation: google.maps.Animation.DROP,
    restaurant: restaurant
  });
  // Add listener to fire actions when marker selected
  marker.addListener('click', function() {
    selectMarker(this, restaurant);
  });
  return marker;
}

// Adjust map bounds to fit all restaurant markers
function fitRestaurantMarkers(restaurants) {
  var bounds = new google.maps.LatLngBounds();
  restaurants.forEach(function(restaurant) {
    bounds.extend(restaurant.position);
  });
  map.fitBounds(bounds);
}

// When marker focused on (ie, click from list item), open info window
function selectMarker(marker, restaurant) {
  openInfoWindow(marker, restaurant);
}

// Open infowindow on marker with defined content
function openInfoWindow(marker, restaurant) {
  populateInfoWindow(restaurant);
  infowindow.open(map, marker);
}

// Populate info window with restaurant information
function populateInfoWindow(r) {
  // Using `r` instead of `restaurant`
  var content = '<h5>' + r.name + '</h5>';

  // Address
  if (r.location.display_address) {
    content += '<p>' + r.location.display_address.join(', ') + '</p>';
  }

  // Yelp star rating image
  var starImgFile = 'img/small_' + String(r.rating).replace('.5', '_half');
  var starImgSrcSet = '<img class="yelp-star-rating" src="{{imgFile}}.png"  srcset="{{imgFile}}@2x.png 2x, {{imgFile}}@3x.png 3x">';
  var yelpRatingImg = starImgSrcSet.replace(/{{imgFile}}/g, starImgFile);

  // Yelp logo
  var yelpLogo = '<a href="' + r.url + '" target="_blank"><img class="yelp-logo" src="img/yelp_logo.png" width="100" height="64"></a>';

  var yelpRating = '<div class="yelp-rating">' +
                   yelpRatingImg +
                   yelpLogo +
                   '</div>';
  content += yelpRating;

  // Review count
  content += '<p>Based On ' + r.review_count + ' ' + (r.review_count === 1 ? 'Review' : 'Reviews') + '</p>';

  // Set content to info window
  infowindow.setContent(content);
}
