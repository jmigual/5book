const $    = require('jquery');
const PIXI = require('pixi.js');
const p2   = require('p2');

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
});

(function ($) {
    $.fn.PongGame = function () {
        /////////////////////////
        // OBJECTS DEFINITIONS //
        /////////////////////////
        
        class GameBodySprite {
            constructor(x, y, width, height, spriteName, bodyOptions) {
                if (!bodyOptions) bodyOptions = {
                    collisionResponse: true,
                    type             : p2.Body.STATIC
                };
                bodyOptions["position"] = [x, y];
                
                this._sprite        = new Sprite(resources[spriteName].texture);
                this._sprite.x      = x;
                this._sprite.y      = y;
                this._sprite.width  = width;
                this._sprite.height = height;
                
                this._body = new p2.Body(bodyOptions);
            }
            
            get sprite() {
                return this._sprite;
            }
            
            get body() {
                return this._body;
            }
            
            update(deltaTime, totalTime) {
                console.log(`Implement this function ${deltaTime} ${totalTime}`);
            }
        }
        
        class GameBall extends GameBodySprite {
            constructor(x, y) {
                const width  = 20,
                      height = 20;
                
                if (!y) y = 40;
                if (!x) x = $(window).width()/2;
                
                // Call parent constructor
                super(x, y, width, height, "ball", {
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
            
            update() {
                this._sprite.x = this._body.interpolatedPosition[0];
                this._sprite.y = this._body.interpolatedPosition[1];
                //console.log("Ball:", this._sprite.x.toFixed(2), this._sprite.y.toFixed(2));
                //console.log("Velocity:", this._body.velocity);
            }
        }
        
        class GameBrick extends GameBodySprite {
            constructor(name, x, y, width, height) {
                if (typeof(width) === "undefined") width = BRICK_WIDTH;
                if (typeof(height) === "undefined") height = BRICK_HEIGHT;
                const normalName     = "brick" + name;
                const grayName       = "brick_gray" + name;
                const grayBorderName = "brick_gray" + name + "_border";
                
                super(x, y, width, height, grayName);
                
                this.NORMAL_NAME      = normalName;
                this.GRAY_NAME        = grayName;
                this.GRAY_BORDER_NAME = grayBorderName;
                
                this._body.position = [x + width/2, y + height/2];
                this._body.addShape(new p2.Box({ width: width, height: height }));
                this._body.collisionResponse = false;
            }
            
            toBorder() {
                this._body.collisionResponse = true;
                this._sprite.texture         = resources[this.GRAY_BORDER_NAME].texture;
            };
            
            toNormal() {
                this._body.collisionResponse = true;
                this._sprite.texture         = resources[this.NORMAL_NAME].texture;
            };
            
            toGray() {
                this._body.collisionResponse = false;
                this._sprite.texture         = resources[this.GRAY_NAME].texture;
            };
        }
        
        class GameBar extends GameBodySprite {
            constructor(x, y) {
                const width  = 100,
                      height = 20;
                
                if (!x) x = $(window).width()/2;
                if (!y) y = 20;
                
                super(x, y, width, height, "bar");
                
                this._body.addShape(new p2.Box({ width: width, height: height }));
                this._sprite.anchor.x = 0.5;
                this._sprite.anchor.y = 0.5;
                
                this.VELOCITY = 150;
                this.vx       = 0;
            }
            
            goRight() {
                this.vx = this.VELOCITY;
            };
            
            goLeft() {
                this.vx = -this.VELOCITY;
            };
            
            stop() {
                this.vx = 0;
            }
            
            update(deltaTime) {
                const dx = deltaTime*this.vx;
                this._body.position[0] += dx;
                this._sprite.position.x += dx;
            }
        }
        
        class GameLivesDisplay {
            constructor() {
                this.playerLives = 3;
                this._sprite     = new PIXI.Text("");
                this._sprite.position.set(20, 20);
            }
            
            get sprite() {
                return this._sprite;
            }
            
            update() {
                this._sprite.text = `Lives: ${this.playerLives}`;
            }
        }
        
        //////////////////
        // MAIN PROGRAM //
        //////////////////
        
        // Aliases for PIXI
        const Sprite    = PIXI.Sprite,
              Container = PIXI.Container,
              loader    = PIXI.loader,
              resources = loader.resources;
        
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
        const renderer = PIXI.autoDetectRenderer($(this).width(), $(this).height()),
              stage    = new Container(),
              ratio    = $(this).width()/$(this).height();
        let world;
        
        $(this).html(renderer.view);
        renderer.backgroundColor   = 0xFFFFFF;
        renderer.transparent       = true;
        
        // Images for sprites
        const images = [
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
        let gameData = {
            mode       : GAME_MODES.PLAYING,
            playerLives: null,
            lastTime   : null,
            currentLine: 0,
            lineCounter: null
        };
        
        let gameObject = {
            ball         : null,
            playerBar    : null,
            topBar       : null,
            brickLines   : [],
            allSpriteBody: [],
            all          : []
        };
        
        function setup() {
            // Set world properties
            world                                    = new p2.World({ gravity: [0, 0] });
            world.defaultContactMaterial.restitution = 1;
            
            setupBricks();
            
            // Add ball to the top center of the screen
            gameObject.ball = new GameBall();
            gameObject.allSpriteBody.push(gameObject.ball);
            
            // Create world boundaries
            world.addBody(createPlane({ position: [0, 0], angle: -Math.PI/2 })); // Left
            world.addBody(createPlane({ position: [renderer.width, 0], angle: Math.PI/2 })); // Right
            world.addBody(createPlane({ position: [0, renderer.height], angle: Math.PI })); // Bottom
            gameObject.topBar = createPlane({ position: [0, 0], angle: 0 }); // Top 
            world.addBody(gameObject.topBar);
            
            // GameBar
            gameObject.playerBar = new GameBar();
            gameObject.allSpriteBody.push(gameObject.playerBar);
            
            // Configure contacts
            world.on("beginContact", function (evt) {
                if ((evt.bodyA === gameObject.ball.body || evt.bodyB === gameObject.ball.body) &&
                    (evt.bodyA === gameObject.topBar || evt.bodyB === gameObject.topBar)) {
                    console.log("Game finished");
                    gameData.playerLives.playerLives--;
                    if (gameData.playerLives.playerLives < 0) {
                        gameData.mode = GAME_MODES.FINISHED_LOOSE;
                    }
                }
            });
            
            // Add playerLives text
            gameData.playerLives = new GameLivesDisplay();
            stage.addChild(gameData.playerLives.sprite);
            gameObject.all.push(gameData.playerLives);
            
            // Add all the elements to the stage
            gameObject.allSpriteBody.forEach(element => {
                stage.addChild(element.sprite);
                world.addBody(element.body);
            });
            
            gameObject.all = gameObject.all.concat(gameObject.allSpriteBody);
            
            setupKeys();
            
            console.log("Setup finished");
            gameLoop(0);
        }
        
        function setupBricks() {
            gameObject.brickLines = [];
            
            const xShift0 = (renderer.width - HOME_COLUMNS*BRICK_WIDTH)/2;
            const bWidth  = (HOME_COLUMNS - 0.5)*BRICK_WIDTH;
            
            // Create bricks wall
            for (let i = 0; i < HOME_ROWS; ++i) {
                let bLine    = [];
                const xShift = xShift0 + (i%2 === 0 ? 0 : BRICK_WIDTH/2);
                const yPos   = renderer.height - BRICK_HEIGHT*(i + 1);
                if (i%2 !== 0) {
                    // Create half bricks;
                    bLine.push(new GameBrick("_half", xShift0, yPos, BRICK_WIDTH/2)); // Head
                    bLine.push(new GameBrick("_half", xShift0 + bWidth, yPos, BRICK_WIDTH/2));   // Tail
                }
                for (let j = 0; j < HOME_COLUMNS - i%2; ++j) {
                    bLine.push(new GameBrick("", BRICK_WIDTH*j + xShift, yPos));
                }
                gameObject.brickLines.push(bLine);
            }
            
            gameObject.brickLines[0].forEach(brick => brick.toBorder());
            gameObject.brickLines.forEach(line => line.forEach(brick => {
                stage.addChild(brick.sprite);
                world.addBody(brick.body);
            }))
        }
        
        function setupKeys() {
            //Capture the keyboard arrow keys
            let keys = {
                left : keyboard(37),
                right: keyboard(39)
            };
            
            keys.left.press = function () {
                console.log("left");
                gameObject.playerBar.goLeft();
            };
            
            keys.left.release = function () {
                if (!keys.right.isDown) {
                    gameObject.playerBar.stop();
                }
            };
            
            keys.right.press = function () {
                console.log("right");
                gameObject.playerBar.goRight();
            };
            
            keys.right.release = function () {
                if (!keys.left.isDown) {
                    gameObject.playerBar.stop();
                }
            };
        }
        
        function loadProgressHandler(loader, resource) {
            console.log("Loading : " + resource.url);
            console.log("Progress: " + loader.progress + "%");
        }
        
        function gameLoop(time) {
            // Loop this function at 60 frames per second
            requestAnimationFrame(gameLoop);
            
            const deltaTime = (gameData.lastTime ? time - gameData.lastTime : 0)/1000;
            
            if (gameData.mode === GAME_MODES.PLAYING) {
                // Update the current game state
                play(deltaTime, time);
            } else if (gameData.mode === GAME_MODES.MAIN_MENU) {
                
            } else if (gameData.mode === GAME_MODES.FINISHED_WON) {
                
            } else if (gameData.mode === GAME_MODES.FINISHED_LOOSE) {
                
            }
            
            // Render the stage to see the animation
            renderer.render(stage);
            gameData.lastTime = time;
        }
        
        /////////////////////////
        // MAIN LOOP FUNCTIONS //
        /////////////////////////
        
        function play(deltaTime, time) {
            world.step(TIME_STEP, deltaTime);
            gameObject.all.forEach(object => {
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
        
        //////////////////////
        // HELPER FUNCTIONS //
        //////////////////////
        
        function keyboard(keyCode) {
            let key         = {};
            key.code        = keyCode;
            key.isDown      = false;
            key.isUp        = true;
            key.press       = undefined;
            key.release     = undefined;
            //The `downHandler`
            key.downHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isUp && key.press) key.press();
                    key.isDown = true;
                    key.isUp   = false;
                    event.preventDefault();
                }
            };
            
            //The `upHandler`
            key.upHandler = function (event) {
                if (event.keyCode === key.code) {
                    if (key.isDown && key.release) key.release();
                    key.isDown = false;
                    key.isUp   = true;
                    event.preventDefault();
                }
            };
            
            //Attach event listeners
            window.addEventListener(
                "keydown", key.downHandler.bind(key), false
            );
            window.addEventListener(
                "keyup", key.upHandler.bind(key), false
            );
            return key;
        }
        
        function createPlane(options) {
            let body = new p2.Body(options);
            body.addShape(new p2.Plane());
            return body;
        }
        
        $(this).resize(() => {
            let w = $(this).width(),
                h = $(this).height();
            $(this).width()/$(this).height() >= ratio ? w *= ratio : h /= ratio;
            
            renderer.view.style.width  = w + 'px';
            renderer.view.style.height = h + 'px';
        });
    }
}($));
