$(document).ready(function () {
  // Show offcanvas menu by default when window >= 768
  if ($(window).width() >= 768) {
    toggleOffcanvas();
  }
  // Set the main content height to match screen size
  setMainContentHeight();
  // TODO: this can be moved to viewmodel
  // Offcanvas menu from http://getbootstrap.com/examples/offcanvas/
  // Toggle the offcanvas menu
  $('[data-toggle="offcanvas"]').click(toggleOffcanvas);
  // Adjust main content height when window resizes
  $( window ).resize(setMainContentHeight);
  // Adjust main content height when toggling collapse menu
  // $('#main-nav').on('show.bs.collapse hide.bs.collapse', setMainContentHeightCollapsing);
});

function toggleOffcanvas() {
  $('.row-offcanvas').toggleClass('active');
  $('#map-container').toggleClass('col-xs-6 col-sm-9');
  // Check if Google maps API has loaded
  if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
    // Trigger resize for map since #map-container changes size
    google.maps.event.trigger(map, 'resize');
  }
}

// Change height of main content to keep app full height
function setMainContentHeight() {
  var windowHeight = $(window).height();
  var navbarHeight = $('.navbar').height();
  $('#main-content').height(windowHeight-navbarHeight);
}
