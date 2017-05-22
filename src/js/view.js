$(document).ready(function () {
  // Set the main content height to match screen size
  setMainContentHeight();
  // Adjust main content height when window resizes
  $( window ).resize(setMainContentHeight);

  function setMainContentHeight() {
    var windowHeight = $(window).height();
    var navbarHeight = $('.navbar').height();
    var height = windowHeight-navbarHeight;
    $('#main-content').height(height);
  }
});
