$(document).ready(function() {
  clear = "rgba(30, 0, 60, 0)";
  filled = "rgba(30, 0, 60, 0.8)";
  $(document).scroll(function() {
    if ($(this).scrollTop() > 0 && $(".top-bar").css("background-color") == clear) {
      $(".top-bar").animate({backgroundColor: filled}, 500);
    }
    else if ($(this).scrollTop() <= 0 && $(".top-bar").css("background-color") == filled) {
      $(".top-bar").animate({backgroundColor: clear}, 500);
    }
  });
});