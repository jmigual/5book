window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000/30);
        };
})();

function WolfGameArea() {
    this.canvas = document.createElement("canvas");
    this.start = function() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        $("#canvas_wolf").html(this.canvas);
        requestAnimationFrame();
    };
    
    this.clear = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
}

var WolfGame = {
    start: function() {
        this.gameArea = new WolfGameArea();
        this.gameArea.start();
    }
};


function updateGameArea(lastTime) {
    WolfGame.clear();
}
