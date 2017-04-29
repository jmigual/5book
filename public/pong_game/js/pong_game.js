var $ = require('jQuery');
var PIXI = require('pixi.js');
var p2 = require('p2');

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
            Container    = PIXI.Container,
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
        var brickLines, ball, counter = 1, lastTime, world, playerBar, gameObjects = [], topBar;
        
        var playerData = {
            mode           : GAME_MODES.PLAYING,
            remaining_lives: 3
        };
        
        function setup() {
            // Set world properties
            world                                    = new p2.World({ gravity: [0, 0] });
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
                brickLines[i].forEach(function (brick) {
                    brick.toGray();
                    stage.addChild(brick.sprite());
                    world.addBody(brick.body());
                });
                if (i === 0) for (var j = 0; j < brickLines[i].length; ++j) {
                    brickLines[i][j].toBorder();
                }
            }
            
            // Add ball to the top center of the screen
            ball = new GameBall();
            stage.addChild(ball.sprite());
            world.addBody(ball.body());
            gameObjects.push(ball);
            
            
            // Bottom
            var planeBody = new p2.Body({ position: [0, renderer.height], angle: Math.PI });
            planeBody.addShape(new p2.Plane());
            world.addBody(planeBody);
            
            // Top 
            topBar = planeBody = new p2.Body({ position: [0, 0], angle: 0 });
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
            
            // GameBar
            playerBar = new GameBar();
            stage.addChild(playerBar.sprite());
            world.addBody(playerBar.body());
            gameObjects.push(playerBar);
            
            // Configure contacts
            world.on("beginContact", function (evt) {
                if ((evt.bodyA === ball.body() || evt.bodyB === ball.body()) &&
                    (evt.bodyA === topBar || evt.bodyB === topBar)) {
                    console.log("Game finished");
                }
            });
            
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
                play(deltaTime, time);
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
        
        function play(deltaTime, time) {
            world.step(TIME_STEP, deltaTime);
            gameObjects.forEach(function (object) {
                object.update(deltaTime, time);
            });
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
        
        var GameBall = (function () {
            
            function GameBall() {
                var width  = 20,
                    height = 20;
                
                // Call parent constructor
                GameObject.call(this, renderer.width/2, 40, width, height, "ball", {
                    type    : p2.Body.DYNAMIC,
                    mass    : 1,
                    velocity: [20, 150]
                });
                
                this._body.addShape(new p2.Circle({ radius: (width + height)/4 }));
                this._body.damping        = 0;
                this._body.angularDamping = 0;
                
                this._sprite.anchor.x = 0.5;
                this._sprite.anchor.y = 0.5;
            }
            
            GameBall.prototype             = Object.create(GameObject.prototype);
            GameBall.prototype.constructor = GameBall;
            
            GameBall.prototype.update = function () {
                this._sprite.x = this._body.interpolatedPosition[0];
                this._sprite.y = this._body.interpolatedPosition[1];
                //console.log("Ball:", this._sprite.x.toFixed(2), this._sprite.y.toFixed(2));
                //console.log("Velocity:", this._body.velocity);
            };
            
            return GameBall;
        })();
        
        
        /////////////////////////
        // OBJECTS DEFINITIONS //
        /////////////////////////
        
        var GameBrick = (function () {
            function GameBrick(name, x, y, width, height) {
                if (typeof(width) === "undefined") width = BRICK_WIDTH;
                if (typeof(height) === "undefined") height = BRICK_HEIGHT;
                var normalName     = "brick" + name;
                var grayName       = "brick_gray" + name;
                var grayBorderName = "brick_gray" + name + "_border";
                
                GameObject.call(this, x, y, width, height, grayName);
                
                this._body.position = [x + width/2, y + height/2];
                this._body.addShape(new p2.Box({ width: width, height: height }));
                
                this.toBorder = function () {
                    this._body.collisionResponse = true;
                    this._sprite.texture         = resources[grayBorderName].texture;
                };
                this.toNormal = function () {
                    this._body.collisionResponse = true;
                    this._sprite.texture         = resources[normalName].texture;
                };
                this.toGray   = function () {
                    this._body.collisionResponse = false;
                    this._sprite.texture         = resources[grayName].texture;
                };
            }
            
            GameBrick.prototype             = Object.create(GameObject.prototype);
            GameBrick.prototype.constructor = GameBrick;
            
            return GameBrick;
        })();
        
        var GameBar = (function () {
            function GameBar() {
                var width  = 100,
                    height = 20;
                GameObject.call(this, renderer.width/2, 20, width, height, "bar");
                
                var fictionBody = new p2.Body({ position: [0, 20], type: p2.Body.STATIC });
                
                this._body.addShape(new p2.Box({ width: width, height: height }));
                this._sprite.anchor.x = 0.5;
                this._sprite.anchor.y = 0.5;
            }
            
            GameBar.prototype             = Object.create(GameObject.prototype);
            GameBar.prototype.constructor = GameBar;
            
            return GameBar;
        })();
        
        function GameObject(x, y, width, height, spriteName, bodyOptions) {
            if (typeof(bodyOptions) === "undefined") {
                bodyOptions = {
                    collisionResponse: true,
                    type             : p2.Body.STATIC
                }
            }
            bodyOptions["position"] = [x, y];
            
            this._geometry = {
                x     : x,
                y     : y,
                width : width,
                height: height
            };
            
            this._sprite        = new Sprite(resources[spriteName].texture);
            this._sprite.x      = x;
            this._sprite.y      = y;
            this._sprite.width  = width;
            this._sprite.height = height;
            
            this._body = new p2.Body(bodyOptions);
        }
        
        GameObject.prototype.sprite = function () {
            return this._sprite;
        };
        
        GameObject.prototype.body = function () {
            return this._body;
        };
        
        GameObject.prototype.update = function (deltaTime, totalTime) {
        
        };
    }
}(jQuery));
