const $      = require('jquery');
const jQuery = $;
const PIXI   = require('pixi.js');
const p2     = require('p2');
const marked = require('marked');
const video  = require('video.js');
const howler = require('howler');
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
        verticalCentered: true,
        loopBottom      : false,
        sectionSelector : ".fp-section",
        navigation      : true,
        paddingBottom   : "100px",
        fixedElements   : "#background",
        afterLoad       : onLoad,
        onLeave         : onLeave
    });
    
    $("#buttonNext").click(() => {
        $.fn.fullpage.moveSectionDown();
    });
    
    $("#buttonPrev").click(() => {
        $.fn.fullpage.moveSectionUp();
    });
    
    $("#buttonStart").click(function () {
        $.fn.fullpage.moveTo(1);
    });
    
    let active = true;
    let sounds = {};
    
    $("#buttonSound").click(function () {
        active   = $(this).data("active");
        this.src = "img/rendered/" + (active ? "sound.png" : "sound_off.png");
        $(this).data("active", !active);
        
        howler.Howler.mute(!active);
    });
    
    ['challenge', 'game', 'text', 'draw'].map(elem => {
        sounds[elem] = new howler.Howl({
            src   : [`audio/${elem}.mp3`],
            loop  : true,
            onfade: function () {
                if (this.volume() === 0) this.pause();
            }
        });
    });
    
    function onLoad() {
        let type = $(this).data('type');
        if (!active || !type) return;
        
        console.log(type);
        sounds[type].play();
        sounds[type].fade(0, 1, 500);
    }
    
    function onLeave() {
        let type = $(this).data('type');
        if (!active || !type) return;
        
        console.log("Leaving: ", type);
        sounds[type].fade(1, 0, 500);
    }
});

