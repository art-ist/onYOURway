define([
    'services/tell',
    'services/map/settings',
    'services/map/mapAdapter'
], function (tell, settings, map) {

    var activeLayer = null;
    var selectedItemObservable;

    var self = {
        initialize: initialize,
        scrollList: scrollList,
        drawPointer: drawPointer
    };
    return self;

    function initialize(pSelectedItemObservable) {
        selectedItemObservable = pSelectedItemObservable;
        map.on({
            'move': function () {
                drawPointer(map);
            }
        });

        pSelectedItemObservable.subscribe(scrollList);

        $('#locationList').scroll(function () {
            drawPointer(map);
        });

    }

    function scrollList(selector) {
        var $listItem = $((selector && selector.Id) ? ('#' + selector.Id()) : selector);
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
        if (activeLayer) { //remove a previously drawn pointer
            map.removeLayer(activeLayer);
        }
        if (!settings.showPointer  //disabled in settings
            || (mode && mode === 'hide')       //drawing-mode hide
            || !selectedItemObservable()        //no item selected
            || !selectedItemObservable().marker //selected item has no marker
            || !settings.showList()   //list not visible
            || !settings.showMap()    //map not visible
        ) { return; } // don't display marker -> done after hiding

        var $listItem = $('#' + selectedItemObservable().Id());
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
        activeLayer = new L.polygon([
            map.containerPointToLatLng([left, top]),
            map.containerPointToLatLng([left, top + height]),
            selectedItemObservable().marker.getLatLng(),
        ], pointerOptions);
        map.addLayer(activeLayer);
    }

});
