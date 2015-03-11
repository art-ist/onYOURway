/*
	display the item to be created/edited on the map
*/
define([
    'services/tell',
    'services/map/mapAdapter',
    'services/map/settings'
], function (tell, map, settings) {
    var leafletMarker = undefined;

    var self = {
        markerGeoLocation: ko.observable(),

        initialize: initialize
    };
    return self;

    function initialize() {
        map.on({
            'click': function (event) {
                if (settings.showSiteCollector()) {
                    setMarkerLocation(event.latlng);
                    self.markerGeoLocation(leafletMarker.getLatLng());
                }
            }
        });

        self.markerGeoLocation.subscribe(setMarkerLocation);

        settings.showSiteCollector.subscribe(function (val) {
            if (val === false && leafletMarker) {
                map.removeLayer(leafletMarker);
                leafletMarker = undefined;
            }
        });
    }

    function setMarkerLocation(geolocation) {
        if (!leafletMarker) {
            // create new marker, if none exists
            leafletMarker = L.marker(toLatLngArray(geolocation), {
                dragable: true,
                prefix: "fa",
                title: "New Entry",
                icon: getLocationIcon()
            });
            map.addLayer(leafletMarker);
            leafletMarker.dragging.enable();
            leafletMarker.on("dragend", function () {
                self.markerGeoLocation(leafletMarker.getLatLng());
            });
        } else {
            leafletMarker.setLatLng(toLatLngArray(geolocation));
        }
        map.panIntoView(leafletMarker);
        return leafletMarker;
    }

    function getLocationIcon() {
        return L.AwesomeMarkers.icon({
            prefix: 'fa',
            markerColor: "cadetblue"
        });
    }

    function toLatLngArray(geolocation) {
        return geolocation.coords ? [geolocation.coords[1], geolocation.coords[0]] : geolocation;
    }

});
