define([
    'services/tell',
    'services/map/settings'
], function (tell, settings) {

    var map = null;

    var self = {
    	initializeMapControl: initializeMapControl,
        panIntoView: panIntoView,
        replaceLayer: replaceLayer,
        removeLayer: removeLayer,
        addLayer: addLayer,
        on: addEventHandler,
        fitBounds: fitBounds,
        setView: setView,
        containerPointToLatLng: containerPointToLatLng,
        invalidateSize: invalidateSize,

        //TODO: baseMap used in _nav.html for menu links. move into _nav.js!
        baseMap: {
            open: baseMapOpenOsm,
            edit: baseMapEditOsm,
            about: baseMapAboutOsm
        }
    };
    return self;

    function initializeMapControl(containerId) {
        tell.log('initializing map control', 'mapAdapter', containerId);
        map = L.map(containerId, {attributionControl: false});
        return map;
    }

    function panIntoView(marker) {
        if (!settings.autoPan) return;
        if (!marker) return;

        var size = L.point(map.getContainer().offsetWidth, map.getContainer().offsetHeight);
        var padding = settings.mapPadding;

        var ll = marker.getLatLng();
        var pos = map.latLngToContainerPoint(ll);
        tell.log('size: ' + size.x + ', ' + size.y + '   pos: ' + pos.x + ', ' + pos.y, 'location - _panMap', { size: map.getSize(), container: size });

        var dx = 0;
        var dy = 0;
        if (pos.x + padding.right > size.x) { // right
            dx = pos.x - size.x + padding.right;
        }
        if (pos.x - dx - padding.left < 0) { // left
            dx = pos.x - padding.left;
        }
        if (pos.y + padding.bottom > size.y) { // bottom
            dy = pos.y - size.y + padding.bottom;
        }
        if (pos.y - dy - padding.top < 0) { // top
            dy = pos.y - padding.top;
        }
        if (dx || dy) {
            map.panBy([dx, dy]);
        }
    }

    function replaceLayer(oldLayer, newLayer) {
        if (oldLayer) removeLayer(oldLayer);
        addLayer(newLayer);
    }

    function addLayer(layer) {
    	tell.log('adding layer', 'map', layer);
        return  map.addLayer(layer);
    }

    function removeLayer(layer) {
        return map.removeLayer(layer);
    }

    function addEventHandler(eventHandler) {
        return map.on(eventHandler);
    }

    function fitBounds(bbox, options) {
    	//http://leafletjs.com/reference.html#map-fitboundsoptions
        return map.fitBounds(bbox, options);
    }

    function fitWorld(options) {
    	//http://leafletjs.com/reference.html#map-fitboundsoptions
    	return map.fitBounds(options);
    }

    function setView(center, zoom) {
        return map.setView(center, zoom);
    }

    function containerPointToLatLng(point) {
        return map.containerPointToLatLng(point);
    }

    function invalidateSize() {
        return map.invalidateSize();
    }

    //TODO: baseMap used in _nav.html for menu links. move into _nav.js!
    function baseMapOpenOsm() {
        var center = map.getCenter();
        var z = smap.getZoom();
        tell.log('called', 'baseMap Open Osm', { center: center, zoom: z });
        window.open('http://www.openstreetmap.org/?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
    }

    function baseMapEditOsm() {
        var center = map.getCenter();
        var z = map.getZoom();
        tell.log('called', 'baseMap Edit Osm', { center: center, zoom: z });
        window.open('http://www.openstreetmap.org/edit?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
    }

    function baseMapAboutOsm() {
        tell.log('called', 'baseMap About Osm');
        window.open('http://www.openstreetmap.org/about');
    }

});