window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000/30);
        };
})();

(function ($) {
    $.fn.PongGame = function () {
        // Aliases for PIXI
        var Sprite       = PIXI.Sprite,
            TextureCache = PIXI.utils.TextureCache,
            Container    = PIXI.Container,
            Texture      = PIXI.Texture,
            loader       = PIXI.loader,
            resources    = loader.resources;
        
        // Constants definition
        const HOME_ROWS    = 10,
              HOME_COLUMNS = 10,
              BRICK_WIDTH  = 40,
              BRICK_HEIGHT = 20,
              imgPath      = "img/"; // Base path for the images
        
        // Configure renderer
        var renderer = PIXI.autoDetectRenderer(800, 600),
            stage    = new Container();
        
        var state = play;
        
        $(this).html(renderer.view);
        renderer.view.style.border = "1px dashed black";
        
        // Images for sprites
        var images = [
            "brick",
            "brick_half",
            "brick_gray",
            "brick_gray_half",
            "brick_gray_border",
            "brick_gray_half_border",
            "ball"
        ].map(function (img) {
            return { name: img, url: imgPath + img + ".png" }
        });
        
        loader.add(images)
            .on("progress", loadProgressHandler)
            .load(setup);
        
        // Define variables that might be used in more than one function
        var brickLines, ball, counter = 1, lastTime = 0;
        
        function GameBall() {
            var sprite    = new Sprite(resources["ball"].texture);
            sprite.x      = renderer.width/2;
            sprite.y      = 10;
            sprite.width  = 20;
            sprite.height = 20;
            
            this.velocity = { x: 1, y: 2 };
            
            this.sprite = function () {
                return sprite;
            };
            
            this.update = function () {
                sprite.x += this.velocity.x;
                sprite.y += this.velocity.y;
            };
        }
        
        function GameBrick(name, x, y, width, height) {
            if (typeof(width) === "undefined") width = BRICK_WIDTH;
            if (typeof(height) === "undefined") height = BRICK_HEIGHT;
            var normalName     = "brick" + name;
            var grayName       = "brick_gray" + name;
            var grayBorderName = "brick_gray" + name + "_border";
            
            var brick    = new Sprite(resources[grayName].texture);
            brick.x      = x;
            brick.y      = y;
            brick.width  = width;
            brick.height = height;
            
            this.sprite   = function () {
                return brick;
            };
            this.toBorder = function () {
                brick.texture = resources[grayBorderName].texture;
            };
            this.toNormal = function () {
                brick.texture = resources[normalName].texture;
            };
            this.toGray   = function () {
                brick.texture = resources[grayName].texture;
            };
        }
        
        function setup() {
            brickLines = [];
            
            for (var i = 0; i < HOME_ROWS; ++i) {
                var bLine  = [];
                var xShift = (renderer.width - HOME_COLUMNS*BRICK_WIDTH)/2;
                var yPos   = renderer.height - BRICK_HEIGHT*(i + 1);
                if (i%2 !== 0) {
                    // Create half brick now;
                    
                    var brickHead = new GameBrick("_half", xShift, yPos, BRICK_WIDTH/2);
                    xShift += BRICK_WIDTH/2;
                    bLine.push(brickHead);
                }
                for (var j = 0; j < HOME_COLUMNS - i%2; ++j) {
                    var brick = new GameBrick("", BRICK_WIDTH*j + xShift, yPos);
                    bLine.push(brick);
                }
                if (i%2 !== 0) {
                    var xpos      = (HOME_COLUMNS - 1)*BRICK_WIDTH + xShift;
                    var brickTail = new GameBrick("_half", xpos, yPos, BRICK_WIDTH/2);
                    bLine.push(brickTail);
                }
                brickLines.push(bLine);
            }
            
            for (var i = 0; i < brickLines.length; ++i) {
                for (var j = 0; j < brickLines[i].length; ++j) {
                    stage.addChild(brickLines[i][j].sprite());
                }
                if (i === 0) {
                    for (var j = 0; j < brickLines[i].length; ++j) {
                        brickLines[i][j].toBorder();
                    }
                }
            }
            
            // Add ball to the top center of the screen
            ball = new GameBall();
            stage.addChild(ball.sprite());
            
            console.log("Setup finished");
            gameLoop(0);
        }
        
        function loadProgressHandler(loader, resource) {
            console.log("Loading : " + resource.url);
            console.log("Progress: " + loader.progress + "%");
        }
        
        function gameLoop(newTime) {
            // Loop this function at 60 frames per second
            requestAnimationFrame(gameLoop);
            
            var deltaTime = newTime - lastTime;
            lastTime      = newTime;
            
            // Update the current game state
            state(deltaTime);
            
            // Render the stage to see the animation
            renderer.render(stage);
            ++counter;
        }
        
        
        function play(deltaTime) {
            console.log((1000/deltaTime).toFixed(2) + " fps");
            ball.update();
        }
    }
}(jQuery));


