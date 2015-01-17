define([
    'services/tell',
    'services/map/mapAdapter'
], function (tell, map) {
    var leafletMarker = undefined;

    var self = {
        isEnabled: ko.observable(false),
        markerGeoLocation: ko.observable(),

        initialize: initialize
    };
    return self;

    function initialize() {
        map.on({
            'click': function (event) {
                if (self.isEnabled()) {
                    setMarkerLocation(event.latlng);
                    self.markerGeoLocation(leafletMarker.getLatLng());
                }
            }
        });

        self.markerGeoLocation.subscribe(setMarkerLocation);

        self.isEnabled.subscribe(function (val) {
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
