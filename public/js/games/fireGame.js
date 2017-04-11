window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000/30);
        };
})();

var fireGame = (function(){
    var data = {
        time   : -1,
        counter: 0
    };
    
    var area = {
        canvas: document.createElement("canvas"),
        start : function () {
            this.canvas.width  = 800;
            this.canvas.height = 600;
            this.context       = this.canvas.getContext("2d");
        
            $("#fire-game-canvas").html(this.canvas);
        },
        clear : function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        update: function (delta) {
            this.context.fillRect(0, 0, data.counter*3, data.counter);
            data.counter += delta/1000;
        }        
    };
    
    function start() {
        area.start();
        requestAnimationFrame(main);
    }
    
    function main(time) {
        if (data.time < 0) {
            data.time = time - 15;
        }
        var delta = time - data.time;
        console.log(delta);
        area.clear();
        area.update(delta);
        data.time = time;
        requestAnimationFrame(main);
    } 
    
    return {
        start: start
    }
}());


