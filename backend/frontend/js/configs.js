/**
 * Created by joan on 22/02/17.
 */

// Contains all the libraries configurations
$(document).ready(function () {
  $("#fullpage").fullpage({
    verticalCentered: false,
    sectionsColor: ["#2B2B2B", "#2B2B2B", "#2B2B2B"],
    loopBottom: true,
    fitToSection: false,

    navigation: true
  });

  /*var options = {
    activeItem: 0
  };

  var carouselQui = $("#qui-som-carousel").CircularCarousel(options);
  $("#qui-som-next").click(function () {
    carouselQui.cycleActive("next");
  });
  $("#qui-som-previous").click(function () {
    carouselQui.cycleActive("previous");
  });*/
  
  var options = {
    ovalWidth: 400,
    ovalHeight: 50,
    offsetX: 100,
    offsetY: 325,
    angle: 0,
    activeItem: 0,
    duration: 350,
    className: 'item'
  };
  
  var carouselQui = $("#qui-som-carousel").CircularCarousel(options);
  $("#qui-som-next").click(function () {
    carouselQui.cycleActive("next");
  });
  $("#qui-som-previous").click(function () {
    carouselQui.cycleActive("previous");
  });
});
