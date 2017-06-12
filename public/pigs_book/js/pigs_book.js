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

$(document).ready(function () {
    $("#pong-game-canvas").PongGame();
    
    $(".markdown").each(function () {
        $(this).html(marked($(this).text()));
    });
    
    $(".canvas-view").each(function(id) {
        let $elem = $(this);
        let idS = `drawing_${id}`;
        
        let container = document.createElement("div");
        $(container).addClass("w3-row");
        
        $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
            let link = document.createElement("a");
            link.href = `#${idS}`;
            link.setAttribute('data-color', this);
            $(link).addClass("w3-col s1");
            
            let color = document.createElement("div");
            color.style = `width: 100%; height: 100%; background: ${this}`;
            $(color).addClass("w3-border w3-hover-opacity");
            $(link).append(color);
            
            $(container).append(link);
        });
        
        $(container).append("<div class='w3-rest'></div>");
        ['brush', 'eraser'].map(elem => {
            let link = document.createElement("a");
            link.href = `#${idS}`;
            link.setAttribute('data-tool', elem);
            link.style = "width: 45px";
            $(link).addClass("w3-col w3-right");
            
            $(link).append(`<img class='w3-image w3-opacity w3-hover-opacity-off' src='./img/rendered/${elem}.png'>`);
            $(container).append(link);
        });
        
        {
            let link = document.createElement("a");
            link.href = `#${idS}`;
            link.setAttribute('data-download', 'pngp');
            link.style = "width: 45px";
            $(link).addClass("w3-col w3-right");
            $(link).append(`<img class='w3-image w3-opacity w3-hover-opacity-off' src='./img/rendered/save.png'>`)
            $(container).append(link);
        }
        
        $elem.append(container);
        
        let canvas = document.createElement("canvas");
        $(canvas).addClass("w3-border");
        $(canvas).attr('id', idS);
        
        $elem.append(canvas);
    
        $(`#drawing_${id}`).sketch();
    });
    
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
        
        console.log("Entering:", type);
        sounds[type].play();
        sounds[type].fade(0, 1, 500);
    }
    
    function onLeave() {
        let type = $(this).data('type');
        if (!active || !type) return;
        
        console.log("Leaving:", type);
        sounds[type].fade(1, 0, 500);
    }
});

