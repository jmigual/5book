window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000/30);
        };
})();

(function($) {
    $.fn.FireGame = function() {
        // Aliases
        var Sprite = PIXI.Sprite;
        var TextureCache = PIXI.utils.TextureCache;
        var loader = PIXI.loader;
        var resources = loader.resources;
        
        var imgPath = "../img/games/pong/"; // Base path for the images
        
        // Configure renderer
        var renderer = PIXI.autoDetectRenderer(800, 600);
        renderer.view.style.border = "1px dashed black";
        $(this).html(renderer.view);
        
        var stage = new PIXI.Container();
        
        var images = ["brick.png", "ball.png"]
            .map(function(img) { return { name: img, url: imgPath + img }});
        
        loader
            .add(images)
            .on("progress", loadProgressHandler)
            .load(setup);
        function setup() {
            var fire = new Sprite(resources["fire.png"].texture);
            var fireplace = new Sprite(resources["fireplace.png"].texture);
            console.log("Setup finished");
            
            stage.addChild(fireplace);
            stage.addChild(fire);
            renderer.render(stage);
        }
        
        function loadProgressHandler(loader, resource) {
            console.log("Loading : " + resource.url);
            console.log("Progress: " + loader.progress + "%");
        }
    }
}(jQuery));


