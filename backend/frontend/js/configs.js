/**
 * Created by joan on 22/02/17.
 */

// Contains all the libraries configurations
$(document).ready(function () {
  $("#fullpage").fullpage({
    verticalCentered: true,
    sectionsColor: ["#2B2B2B", "#2B2B2B", "#2B2B2B"],
    loopBottom: false,
    fitToSection: false,
    paddingTop: 0,
    sectionSelector: ".fp-section",
    scrollOverflow: true,
    scrollOverflowOptions: {
      mouseWheelSpeed: 100,
      bounce: false
    },

    navigation: true
  });
  
  var options = {
    indicators: false,
    dist: -20,
    noWrap: false,
    fullWidth: false
  };
  
  $("#qui-som-carousel").carousel(options);
  $("#carousel-categories").carousel(options);
});
