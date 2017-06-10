const $       = require('jquery');
const jQuery  = $;
const PIXI    = require('pixi.js');
const p2      = require('p2');
const marked  = require('marked');
const videojs = require('video.js');
require('./game');
require('./jquery.fullpage');
require('./sketch');

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 30);
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
        verticalCentered: true,
        loopBottom      : false,
        sectionSelector : ".fp-section",
        navigation      : true,
        paddingBottom   : "100px",
        fixedElements   : "#background",
        afterLoad       : function (anchorLink, index) {
            console.log(anchorLink, index);
        }
    });

    $("#buttonNext").click(() => {
        $.fn.fullpage.moveSectionDown();
    });

    $("#buttonPrev").click(() => {
        $.fn.fullpage.moveSectionUp();
    });

    $("#buttonSound").click(function () {
        let active = $(this).data("active");
        this.src   = "img/rendered/" + (active ? "sound_off.png" : "sound.png");
        $(this).data("active", !active);
    });

    $("#buttonStart").click(function () {
        $.fn.fullpage.moveTo(1);
    })
});

