const $      = require('jquery');
const jQuery = $;
const PIXI   = require('pixi.js');
const p2     = require('p2');
const marked = require('marked');
require('./game');
require('./jquery.fullpage');
require('./sketch');

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000/30);
        };
})();

$(document).ready(function () {
    $("#pong-game-canvas").PongGame();
    
    $(".markdown").each(function () {
        $(this).html(marked($(this).text()));
    });
    
    const elem = $(".canvas-view");
    elem.sketch();
    elem.sketch().redraw();
    
    $("#main-container").fullpage({
        verticalCentered     : true,
        loopBottom           : false,
        fitToSection         : false,
        paddingTop           : 0,
        sectionSelector      : ".fp-section",
        scrollOverflow       : true,        
        navigation: true,
        afterLoad: function(anchorLink, index) {
            console.log(anchorLink, index);
        }
    });
    
    $("#buttonNext").click(function(e) {
        e.preventDefault();
        $.fn.fullpage.moveSectionDown();
    });
    
    $("#buttonPrev").click(function(e) {
        e.preventDefault();
        $.fn.fullpage.moveSectionUp();
    })
});

