/**
 * Created by joan on 20/02/17.
 */

(function ($) {
  
  $.fn.CircularCarousel = function (options) {
  
    var $ele = $(this);
    var childs = $ele.children("figure"),
        count = childs.length,
        angleStep = (2*Math.PI)/count,
        width = $ele.width(),
        radius = Math.round((width/2)/Math.tan(angleStep/2));
        activeItem = options.activeItem;
  
    console.log(childs);
    console.log("Width:", width, "Angle Step:", angleStep, "Radius:", radius);
  
    function drawCarousel() {
      if (count <= 0)
        return;
  
      width = $ele.width();
      radius = Math.round(width/2) - 1;
      var imageWidth = 2*radius*Math.cos(angleStep/2);
      
      $(childs).each(function(i) {
        var thetaInterior = (360/count)*i;
        console.log(this);
        $(this).css({"transform": "rotateY(" + thetaInterior + "deg) translateZ(" + radius + "px)" });
        $(this).width(imageWidth);
      });
  
      $(this).height($(childs[0]).height() + 50);
    }
    
    function updateCarousel() {
      if (count <= 0)
        return;
    
      var theta = 360/count*(activeItem);
      $ele.css("transform", "translateZ(" + (-radius) + "px) rotateY(" + theta + "deg)");
    }
    
    console.log("Pepito");
    
    drawCarousel();
    updateCarousel();
    
    $(document).ready(function() {
      $(window).resize(drawCarousel);
    });
    
    var methods = {
      cycleActive: function (direction) {
        activeItem += ((direction === 'previous')) ? -1 : 1;
        updateCarousel();
      }
    }
  };
  
}(jQuery));
