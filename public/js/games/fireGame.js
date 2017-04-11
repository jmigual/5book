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
        var $elem = $(this);
        var data = {
            time   : -1,
            counter: 0,
            objects: [],
            firePlace: null
        };
    
        var area = {
            canvas: document.createElement("canvas"),
            start : function () {
                this.canvas.width  = 800;
                this.canvas.height = 600;
                this.context       = this.canvas.getContext("2d");
            
                $elem.html(this.canvas);
            },
            clear : function () {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        };
    
        function start() {
            area.start();
            
            var w = area.canvas.width;
            var h = area.canvas.height;
            data.firePlace = new FireElement(w/2, h, 20, 20);
            data.objects.push(data.firePlace);
            
            requestAnimationFrame(main);
        }
    
        function main(time) {
            if (data.time < 0) {
                data.time = time - 15;
            }
            var delta = time - data.time;
            data.time = time;
            area.clear();
            
            data.objects.forEach(function(object) {
                object.update(delta);
            });
            requestAnimationFrame(main);
        }
        
        function FireElement(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.totalTime = 0;
            this.speed = 0.007;
            this.base = 0.2;
            
            this.update = function(delta) {
                // Get custom scale
                var scale = Math.sin(this.totalTime) + 1 + this.base;
                this.totalTime += this.speed*delta;
                
                var widthS = this.width*scale;
                var heightS = this.height*scale;
                //console.log(widthS, heightS);
                
                var x0 = this.x - (widthS)/2;
                var y0 = this.y - heightS;
                area.context.fillRect(x0, y0, widthS, heightS);
            }
        }
    
        return {
            start: start
        }
    }
}(jQuery));


