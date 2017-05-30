// Declare variables to reference outside initMap
var mapInstance;

// Google map
var MapViewModel = function() {
  var self = this;

  // Create map object
  self.map = new google.maps.Map(document.getElementById('map'), {
    center: config.locationCenter,
    scrollwheel: true,
    zoom: 15,
    clickableIcons: false,
    streetViewControl: false
  });
  // Infowindows for markers
  self.infowindow = new google.maps.InfoWindow();
  // Toogle off canvas list once map has loaded
  google.maps.event.addListenerOnce(self.map, 'idle', function() {
    // Map is done loading
    viewModelInstance.mapLoading(false);
  });

  self.createMarker = function(restaurant) {
    var marker = new google.maps.Marker({
      position: restaurant.position,
      title: restaurant.name,
      restaurant: restaurant
    });
    // Change active restaurant when marker clicked
    marker.addListener('click', function() {
      viewModelInstance.activeRestaurant(restaurant);
    });
    return marker;
  };
  // Adjust map bounds to fit all restaurant markers
  self.fitRestaurantMarkers = function(restaurants) {
    var bounds = new google.maps.LatLngBounds();
    restaurants.forEach(function(restaurant) {
      bounds.extend(restaurant.position);
    });
    self.map.fitBounds(bounds);
  };
  // When marker focused on (ie, click from list item), open info window
  self.selectMarker = function(marker, restaurant) {
    // Check if a map marker is currently active.
    // If it is, set icon back to default.
    if (viewModelInstance.activeMarker !== null) {
      viewModelInstance.activeMarker.setIcon();
      viewModelInstance.activeMarker.setZIndex(0);
    }
    // Set new marker as active marker
    viewModelInstance.activeMarker = marker;
    // Change marker to blue
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
    // Set Z Index so icon is visible above others
    marker.setZIndex(999);
    // Open infowindow
    self.openInfoWindow(marker, restaurant);
  };
  // Open infowindow on marker with defined content
  self.openInfoWindow = function(marker, restaurant) {
    self.populateInfoWindow(restaurant);
    self.infowindow.open(self.map, marker);
  };
  // Populate info window with restaurant information
  self.populateInfoWindow = function(r) {
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
    self.infowindow.setContent(content);
  };
};

function initMap() {
  mapInstance = new MapViewModel();
}
