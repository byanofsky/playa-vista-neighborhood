$(document).ready(function () {
  // TODO: this can be moved to viewmodel
  // Toggle the offcanvas menu
  $('[data-toggle="offcanvas"]').click(toggleOffcanvas);
  // Display offcanvas menu
  // from http://getbootstrap.com/examples/offcanvas/
});

function toggleOffcanvas() {
  $('.row-offcanvas').toggleClass('active');
  $('#map-container').toggleClass('col-xs-9');
}
