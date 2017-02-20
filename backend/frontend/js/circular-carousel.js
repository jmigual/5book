/**
 * Created by joan on 20/02/17.
 */

$(document).ready(function () {
  $(window).resize(function () {
    $(".carousel").each(drawCarousel);
  });
  $(".carousel").each(drawCarousel);
});

function drawCarousel() {
  var childs = $(this).children();
  if (childs.length <= 0) 
    return;
  
  var count = childs.length;
  var width = $(this).width();
  var angleStep = (2*Math.PI)/(childs.length);
  var radius = Math.round((width/2)/Math.tan(angleStep/2));
  console.log("Width:", width, "Angle Step:", angleStep, "Radius:", radius);
  
  var selected = $(this).data("selected");
  var theta = (2*Math.PI)/count*(selected);
  $(this).css("transform", "translateZ(" + (-radius) + "px) rotateY(" + theta + ")");
}
