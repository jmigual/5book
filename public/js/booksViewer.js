/**
 * Created by joan on 01/03/17.
 */ 

(function($) {
    
    $.fn.BookView = function(options) {
        var opts = $.extend({
            type: ""
        }, options);
        
        var $elem = $(this);
        
        // We load first all the elements in JSON and then 
        // add them one by one to the HTML
        $.get('../data/' + opts.type, function(data) {
            addElements($.csv.toObjects(data));
        });
        
        function addElements(data) {
            console.log(data);
        }
        
        return {
            warn: function() {
                console.log("Hello world");
            }
        };
    }
    
})(jQuery);
