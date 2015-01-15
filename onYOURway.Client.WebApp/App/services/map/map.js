define([
    'services/app',
    'services/tell',
    'services/geoUtils',
    'services/api/searchSuggestions',
    'services/map/fiveMinuteDistanceLayer',
    'services/map/placesLayer',
    'services/map/pointerLayer',
    'services/map/regionLayer',
    'services/map/routingLayer',
    'services/map/siteCollectorLayer',
    'services/map/tileLayer'
], function (app, tell, geoUtils, searchSuggestions, fiveMinuteDistanceLayer, placesLayer, pointerLayer, regionLayer, routingLayer, siteCollectorLayer, tileLayer) {

    //TODO: refactor the itemClick method correctly
    placesLayer.itemClick = itemClick;

    var self = {
        initializeMap: initializeMap,
        loadRegionFeatures: loadRegionFeatures,
        getLocationIcon: placesLayer.getLocationIcon,
        panIntoView: panMap,
        setView: setView,
        itemClick: itemClick,

        //TODO: baseMap... seem to be unused, verify and delete
        baseMap: {
            open: baseMapOpenOsm,
            edit: baseMapEditOsm,
            about: baseMapAboutOsm
        },

        setTileLayer: tileLayer.setTileLayer,

        setMode: routingLayer.setMode,
        locate: routingLayer.locate,

        getCurrentPosition: fiveMinuteDistanceLayer.getCurrentPosition,

        drawPointer: pointerLayer.drawPointer
    };
    return self;

    function initializeMap(containerId) {
        var location = self.location;

        tell.log('[location] Initializing Map', 'location', containerId);

        //create map
        var map = L.map(containerId, { attributionControl: false });
        //L.control.attribution({
        //	position: 'bottomleft',
        //	prefix: false
        //}).addTo(map);

        location.map = map;

        //register eventhandlers for map
        map.on({
            'move': function () {
                pointerLayer.drawPointer();
            },
            'click': function (event) {
                if (location.siteCollectorMode()) {
                    siteCollectorLayer.setSiteCollectorMarker(event.latlng, true);
                }
            }
        });

        //TODO: move siteCollector initialization into siteCollectorLayer.js
        // update siteCollectorMarker when changing the siteCollectorCoords
        location.siteCollectorCoords.subscribe(siteCollectorLayer.setSiteCollectorMarker);

        // disable siteCollectorMarker when closing the siteCollector
        location.siteCollectorMode.subscribe(function (val) {
            if (val === false && location.siteCollectorMarker) {
                location.map.removeLayer(location.siteCollectorMarker);
                location.siteCollectorMarker = undefined;
            }
        });

        //register eventhandlers for list
        var list = $('#locationList');
        list.scroll(function () {
            pointerLayer.drawPointer();
        });

        //load tile layer
        tileLayer.setTileLayer(0);

        //getCurrentPosition();

        //get regions
        regionLayer.loadRegions(map);

        //get locations and search suggestions
        loadRegionFeatures();

        //  })
        //  .fail(function (err) {
        //  	tell.log('matadata could not be requested:' + err.message, 'location');
        //  })
        //;

        //_showTransport(map);

        /* define and hook up the eventhandlers */
        //map.on('click', function (e) {
        //  location.showMessage('Map klicked at ' + JSON.stringify(e.latlng), 'Map Event');
        //});
    }

    function loadRegionFeatures() {
        var location = self.location;
        placesLayer.loadPlaces();

        require(['services/app', 'services/location'], function (app, location) {
            searchSuggestions.loadSearchSuggestions(app.lang, location.Region);
        });
    }

    function panMap(marker) { //pan the selected marker into view
        var location = self.location;

        if (!location.settings.autoPan) return;
        if (!marker) { //try to find marker of selected item
            if (!location.selectedItem()) {
                return;
            }
            else {
                marker = location.selectedItem().marker;
                if (!marker) return;
            }
        } //if (!marker)

        var map = location.map;
        var size = L.point(map.getContainer().offsetWidth, map.getContainer().offsetHeight); //map.getSize();
        var padding = location.settings.mapPadding;

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

    function setView(i) {
        var location = self.location;

        var map = location.map;
        var view = location.views()[i];
        var box = geoUtils.wktToCoords(view.Boundary().Geography.WellKnownText);
        map.fitBounds([[box[3][1], box[3][0]], [box[1][1], box[1][0]]]);
        return;
    }

    function itemClick(e) {
        var location = self.location;

        var oldLoc = location.selectedItem();

        //get new marker and loc(ation)
        var marker, loc;
        if (e.target) { //marker ... loc in e.target.data
            marker = e.target;
            loc = e.target.data;
        }
        else if (e.marker) { //bound item (e.g. locationList) ... marker in e.marker
            marker = e.marker;
            loc = e;
        }

        //if already selected toggle details and return
        if (oldLoc === loc) {
            location.toggleDetails();
        }
        else {
            //restore marker of formerly selected item
            if (oldLoc) {
                oldLoc.marker
                    .setIcon(placesLayer.getLocationIcon(oldLoc))
                    .setZIndexOffset(0)
                    .setOpacity(oldLoc.isOpen() ? 1 : 0.3)
                ;
            }
            //select new item
            location.selectedItem(loc);
            //highlight new marker
            marker
                .setIcon(placesLayer.getLocationIcon(loc, true))
                .setZIndexOffset(10000)
                .setOpacity(loc.isOpen() ? 1 : 0.8)
            ;
        }

        var selItmsIdx = location.selectedItems.indexOf(loc);
        if (selItmsIdx >= 0) {
            location.selectedItems.splice(selItmsIdx, 1);
        }
        location.selectedItems.unshift(loc);
        if (location.selectedItems().length > location.settings.maxSelectedItems) {
            location.selectedItems.pop();
        }

        pointerLayer.drawPointer();
        pointerLayer.scrollList('#' + loc.Id());
        panMap(marker);

    }



    //TODO: baseMap... seem to be unused, verify and delete
    function baseMapOpenOsm() {
        var center = self.location.map.getCenter();
        var z = self.location.map.getZoom();
        tell.log('called', 'baseMap Open Osm', { center: center, zoom: z });
        window.open('http://www.openstreetmap.org/?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
    }

    function baseMapEditOsm() {
        var center = self.location.map.getCenter();
        var z = self.location.map.getZoom();
        tell.log('called', 'baseMap Edit Osm', { center: center, zoom: z });
        window.open('http://www.openstreetmap.org/edit?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
    }

    function baseMapAboutOsm() {
        tell.log('called', 'baseMap About Osm');
        window.open('http://www.openstreetmap.org/about');
    }


});