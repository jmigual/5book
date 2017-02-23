/**
 * Created by joan on 22/02/17.
 */

// Contains all the libraries configurations
$(document).ready(function () {
  $("#fullpage").fullpage({
    verticalCentered: false,
    sectionsColor: ["#2B2B2B", "#2B2B2B", "#2B2B2B"],
    loopBottom: true,
    fitToSection: true,

    navigation: true
  });
  
  var options = {
    indicators: false,
    dist: -20,
    noWrap: false,
    fullWidth: false
  };
  
  $("#qui-som-carousel").carousel(options);
});
