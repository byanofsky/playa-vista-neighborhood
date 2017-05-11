$(document).ready(function () {
  // TODO: this can be moved to viewmodel
  // Show offcanvas menu by default when window >= 768
  if ($(window).width() >= 768) {
    toggleOffcanvas();
  }
  // Toggle the offcanvas menu
  $('[data-toggle="offcanvas"]').click(toggleOffcanvas);
  // Display offcanvas menu
  // from http://getbootstrap.com/examples/offcanvas/
  function toggleOffcanvas() {
    $('.row-offcanvas').toggleClass('active');
    $('#map-container').toggleClass('col-xs-9');
  }
});
