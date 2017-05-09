function initMap() {
  // Create a map object and specify the DOM element for display.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 33.972536, lng: -118.426561},
    scrollwheel: false,
    zoom: 14
  });
}
