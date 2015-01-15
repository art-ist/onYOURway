define([
    'services/app',
    'services/tell'
], function (app, tell) {

    var self = {
        scrollList: scrollList,
        drawPointer: drawPointer
    };
    return self;

    function scrollList(selector) {
        var $listItem = $(selector);
        if ($listItem.length > 0) {
            $listItem.scrollIntoView({
                duration: 500,
                easing: false, //'swing', //'easeOutExpo',
                complete: $.noop(),
                step: $.noop(),
                queue: false,
                specialEasing: 'swing' //what's the difference to easing?
            });
        }
    }

    function drawPointer(mode) { //draws a pointer to connect the listitem of the selected venture with its marker
        var location = self.location;
        var map = location.map;
        if (location.layers.pointerLayer) { //remove a previously drawn pointer
            map.removeLayer(location.layers.pointerLayer);
        }
        if (!location.settings.showPointer  //disabled in settings
            || (mode && mode === 'hide')       //drawing-mode hide
            || !location.selectedItem()        //no item selected
            || !location.selectedItem().marker //selected item has no marker
            || !location.settings.showList()   //list not visible
            || !location.settings.showMap()    //map not visible
        ) { return; } // don't display marker -> done after hiding

        var $listItem = $('#' + location.selectedItem().Id());
        if ($listItem.length === 0) return; //dom element for selectesd item not found -> run away (after hiding ;)
        var $list = $('#locationList');
        var $map = $('#map');

        var offset = 8;
        var height = 15;
        var pointerOptions = {
            className: 'oyw-map-pointer',
            weight: null,
            color: null,
            opacity: null,
            fillColor: null,
            fillOpacity: null,
            zIndexOffset: 9999
        };
        var top = $listItem.offset().top + offset - $map.offset().top;
        var left = $list.position().left + $listItem.position().left;
        var pointer = new L.polygon([
            map.containerPointToLatLng([left, top]),
            map.containerPointToLatLng([left, top + height]),
            location.selectedItem().marker.getLatLng(),
        ], pointerOptions);
        location.layers.pointerLayer = pointer;
        map.addLayer(pointer);
    }

});
