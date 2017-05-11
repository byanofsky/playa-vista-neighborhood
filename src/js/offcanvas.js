// from http://getbootstrap.com/examples/offcanvas/
$(document).ready(function () {
  $('[data-toggle="offcanvas"]').click(function () {
    $('.row-offcanvas').toggleClass('active');
    $('#map-container').toggleClass('col-xs-9');
  });
});
