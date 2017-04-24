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
              IMG_PATH     = "img/", // Base path for the images,
              TIME_STEP    = 1/60,
              GAME_MODES   = {
                  PLAYING       : 1,
                  MAIN_MENU     : 2,
                  FINISHED_WON  : 3,
                  FINISHED_LOOSE: 4
              };
        
        // Configure renderer
        var renderer = PIXI.autoDetectRenderer(800, 600),
            stage    = new Container();
        
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
            "ball",
            "bar"
        ].map(function (img) {
            return { name: img, url: IMG_PATH + img + ".png" }
        });
        
        loader.add(images)
            .on("progress", loadProgressHandler)
            .load(setup);
        
        // Define variables that might be used in more than one function
        var brickLines, ball, counter = 1, lastTime, world;
        
        var playerData = {
            mode           : GAME_MODES.PLAYING,
            remaining_lives: 3
        };
        
        function setup() {
            // Set world properties
            world          = new p2.World({ gravity: [0, 0] });
            world.defaultContactMaterial.restitution = 1;
            
            brickLines = [];
            
            var xShift0 = (renderer.width - HOME_COLUMNS*BRICK_WIDTH)/2;
            var bWidth  = (HOME_COLUMNS - 0.5)*BRICK_WIDTH;
            
            // Create bricks wall
            for (var i = 0; i < HOME_ROWS; ++i) {
                var bLine  = [];
                var xShift = xShift0 + (i%2 === 0 ? 0 : BRICK_WIDTH/2);
                var yPos   = renderer.height - BRICK_HEIGHT*(i + 1);
                if (i%2 !== 0) {
                    // Create half bricks;
                    bLine.push(new GameBrick("_half", xShift0, yPos, BRICK_WIDTH/2)); // Head
                    bLine.push(new GameBrick("_half", xShift0 + bWidth, yPos, BRICK_WIDTH/2));   // Tail
                }
                for (var j = 0; j < HOME_COLUMNS - i%2; ++j) {
                    bLine.push(new GameBrick("", BRICK_WIDTH*j + xShift, yPos));
                }
                brickLines.push(bLine);
            }
            
            // Add the sprites to the stage
            for (var i = 0; i < brickLines.length; ++i) {
                for (var j = 0; j < brickLines[i].length; ++j) {
                    stage.addChild(brickLines[i][j].sprite());
                    world.addBody(brickLines[i][j].body());
                }
                if (i === 0) for (var j = 0; j < brickLines[i].length; ++j) {
                    brickLines[i][j].toBorder();
                }
            }
            
            // Add ball to the top center of the screen
            ball = new GameBall();
            stage.addChild(ball.sprite());
            world.addBody(ball.body());
            
            
            // Bottom
            var planeBody = new p2.Body({ position: [0, renderer.height], angle: Math.PI });
            planeBody.addShape(new p2.Plane());
            world.addBody(planeBody);
            
            // Top 
            planeBody = new p2.Body({ position: [0, 0], angle: 0 });
            planeBody.addShape(new p2.Plane());
            world.addBody(planeBody);
            
            // Left
            planeBody = new p2.Body({ position: [0, 0], angle: -Math.PI/2 });
            planeBody.addShape(new p2.Plane());
            world.addBody(planeBody);
    
            // Right
            planeBody = new p2.Body({ position: [renderer.width, 0], angle: Math.PI/2 });
            planeBody.addShape(new p2.Plane());
            world.addBody(planeBody);
            
            console.log("Setup finished");
            gameLoop(0);
        }
        
        function loadProgressHandler(loader, resource) {
            console.log("Loading : " + resource.url);
            console.log("Progress: " + loader.progress + "%");
        }
        
        function gameLoop(time) {
            // Loop this function at 60 frames per second
            requestAnimationFrame(gameLoop);
            
            var deltaTime = lastTime ? time - lastTime : 0;
            deltaTime /= 1000;
            
            if (playerData.mode === GAME_MODES.PLAYING) {
                // Update the current game state
                play(deltaTime);
            } else if (playerData.mode === GAME_MODES.MAIN_MENU) {
                
            } else if (playerData.mode === GAME_MODES.FINISHED_WON) {
                
            } else if (playerData.mode === GAME_MODES.FINISHED_LOOSE) {
                
            }
            
            // Render the stage to see the animation
            renderer.render(stage);
            ++counter;
            lastTime = time;
        }
        
        /////////////////////////
        // MAIN LOOP FUNCTIONS //
        /////////////////////////
        
        function play(deltaTime) {
            world.step(TIME_STEP, deltaTime);
            ball.update();
        }
        
        // This function has to show the different options and the button showing 'play'
        function mainMenu(deltaTime) {
            
        }
        
        // Has to show the text saying the player that it has won
        function finished_win(deltaTime) {
            
        }
        
        // Has to show the text to finish and loose
        function finished_loose(deltaTime) {
            
        }
        
        /////////////////////////
        // OBJECTS DEFINITIONS //
        /////////////////////////
        
        
        function GameBall() {
            var width  = 20,
                height = 20;
            
            var body = new p2.Body({
                position         : [renderer.width/2, 10],
                collisionResponse: true,
                type             : p2.Body.DYNAMIC,
                velocity         : [20, 150],
                mass             : 1
            });
            body.addShape(new p2.Circle({ radius: (width + height)/4 }));
            body.damping = 0;
            body.angularDamping = 0;
            
            var sprite    = new Sprite(resources["ball"].texture);
            sprite.x      = body.position[0];
            sprite.y      = body.position[1];
            sprite.width  = width;
            sprite.height = height;
            sprite.pivot.x = width/2;
            sprite.pivot.y = height/2;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            
            this.sprite = function () {
                return sprite;
            };
            this.body   = function () {
                return body;
            };
            this.update = function () {
                sprite.x = body.interpolatedPosition[0];
                sprite.y = body.interpolatedPosition[1];
                console.log("Ball:", sprite.x.toFixed(2), sprite.y.toFixed(2));
                console.log("Velocity:", body.velocity);
            };
        }
        
        function GameBrick(name, x, y, width, height) {
            if (typeof(width) === "undefined") width = BRICK_WIDTH;
            if (typeof(height) === "undefined") height = BRICK_HEIGHT;
            var normalName     = "brick" + name;
            var grayName       = "brick_gray" + name;
            var grayBorderName = "brick_gray" + name + "_border";
            
            var body = new p2.Body({
                position         : [x + width/2, y + height/2],
                collisionResponse: true,
                type             : p2.Body.STATIC
            });
            body.addShape(new p2.Box({ width: width, height: height }));
            
            var brick    = new Sprite(resources[grayName].texture);
            brick.x      = x;
            brick.y      = y;
            brick.width  = width;
            brick.height = height;
            
            this.sprite   = function () {
                return brick;
            };
            this.body     = function () {
                return body;
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
    }
}(jQuery));


