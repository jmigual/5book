/**
 * Created by joan on 01/03/17.
 */ 

(function($) {
    
    $.fn.BookView = function(options)  {
        var opts = $.extend({
            type: ""
        }, options);
        
        var $elem = $(this);
        
        var rowCount = 0;
        var file = '../data/' + opts.type + '.csv';
        
        var $rowElement;
        
        // We load first all the elements in JSON and then 
        // add them one by one to the HTML
        console.log("Loading: " + file);
        Papa.parse(file, {
            header:true,
            skipEmptyLines: true,
            download: true,
            complete: function(results, file) {
                results.data.forEach(addElement)
            }
        });
    
    
        function addElement(bookInfo) {
            // Check for properties
            if (!bookInfo.hasOwnProperty("name") ||
                !bookInfo.hasOwnProperty("description") ||
                !bookInfo.hasOwnProperty("imagePath")) return;
        
            if (rowCount % 4 == 0) {
                $rowElement = $(document.createElement("div"));
                $rowElement.addClass("w3-row-padding");
                $elem.append($rowElement.get(0));
            }
        
            var book = document.createElement("div");
            $(book).addClass("w3-quarter");
    
            // Image
            var image = document.createElement("img");
            $(image).addClass("w3-image");
            $(image).attr('src', "../img/categories/" + opts.type + "/" + bookInfo.imagePath);
            
            var cardImage = document.createElement("div");
            $(cardImage).addClass("w3-third");
            $(cardImage).append(image);
        
            // Create title
            var title = document.createElement("h4");
            $(title).append(bookInfo.name);
        
            // Insert description
            var description = document.createElement("p");
            $(description).append(bookInfo.description);
            
            var cardContainer = document.createElement("div");
            $(cardContainer).addClass("w3-rest");
            $(cardContainer).css("padding-left", "4px");
            $(cardContainer).append(title, description);
            
            var cardRow = document.createElement("div");
            $(cardRow).addClass("w3-row");
            $(cardRow).append(cardImage, cardContainer);
            
            var card = document.createElement("div");
            $(card).addClass("w3-card w3-white w3-round w3-padding-small");
            $(card).append(cardRow);
        
            $(book).append(card);
            $rowElement.append(book);
            ++rowCount;
        }
        
        return {
            warn: function() {
                console.log("Hello world");
            }
        };
    }
    
})(jQuery);
