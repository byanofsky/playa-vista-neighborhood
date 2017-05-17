$(document).ready(function () {
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
  // Trigger resize for map since #map-container changes size
  google.maps.event.trigger(map, 'resize');
}

// Change height of main content to keep app full height
function setMainContentHeight() {
  var windowHeight = $(window).height();
  var navbarHeight = $('.navbar').height();
  $('#main-content').height(windowHeight-navbarHeight);
}

// Change height of main content when collapsing navbar
function setMainContentHeightCollapsing() {
  console.log('Start content height adjustments on collapse');
  var collapsing = true;
  var resizingInterval = setInterval(setMainContentHeight, 1);
  $('#main-nav').on('shown.bs.collapse hidden.bs.collapse', function() {
    clearInterval(resizingInterval);
    console.log('Stop resize');
  });
}
