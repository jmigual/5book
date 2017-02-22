/**
 * Created by joan on 20/02/17.
 */

(function ($) {

  $.fn.CircularCarousel = function (options) {

    var $ele = $(this),
        $parEle = $($ele.parent());
    var figures = $ele.children("figure"),
        count = figures.length,
        angleStep = (2*Math.PI)/count,
        width,
        radius;
        activeItem = options.activeItem;

    function updateHeight() {
      if (count <= 0)
        return;

      var $parent = $ele.parent(".carousel-container");
      //console.log($parent);
      var max = 0;
      for (var i = 0; i < count; ++i) {
        var h = $(figures[i]).height() + 50;
        if (h > max) max = h;
      }
      $parent.height(max);
      console.log("Max:", max);
    }

    function updateCarousel() {
      if (count <= 0)
        return;

      var theta = 360/count*(activeItem);
      $ele.css("transform", "translateZ(" + (-0) + "px) rotateY(" + theta + "deg)");
      updateHeight();
    }

    function drawCarousel() {
      if (count <= 0)
        return;

      console.log("Updated");
      width = $parEle.width();
      var imageWidth = Math.min(0.9*width, 1200);
      radius = (imageWidth/2)/(Math.tan(angleStep/2));

      //console.log(figures);
      console.log("Widths:", width, "Angle Step:", angleStep, "Radius:", radius);

      $(figures).each(function(i) {
        var thetaInterior = (360/count)*i;
        //console.log(this);
        $(this).css({"transform": "rotateY(" + thetaInterior + "deg) translateZ(" + 0 + "px)" });
        $(this).width(imageWidth);
        //console.log("Image width (" + i + "):", imageWidth)
      });
      updateCarousel();
    }

    drawCarousel();
    updateCarousel();

    $(document).ready(function() {
      $(window).resize(drawCarousel);
    });

    $ele.resize(drawCarousel);
    $(figures).resize(drawCarousel);

    var methods = {
      cycleActive: function (direction) {
        console.log("Clicked: " + direction);
        activeItem += ((direction === 'previous')) ? -1 : 1;
        updateCarousel();
      }
    };

    return methods;
  };

}(jQuery));
