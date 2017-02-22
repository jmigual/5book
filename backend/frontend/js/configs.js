/**
 * Created by joan on 22/02/17.
 */

// Contains all the libraries configurations
$(document).ready(function () {
    $("#fullpage").fullpage({
        verticalCentered: false,
        sectionsColor   : ["#2B2B2B", "#2B2B2B", "#2B2B2B"],
        loopBottom      : true,
        fitToSection    : false,

        navigation: true
    });

    var options = {
        activeItem: 0
    };
    $(".carousel").each(function() {
        var carousel = $(this).CircularCarousel(options);
    });
    /*var carousel = $("#qui-som-carousel").CircularCarousel(options);
     $(".carousel .item").click(function (e) {
     var index = $(this).index('li');
     carousel.cycleActiveTo(index);
     e.preventDefault();
     })*/
});