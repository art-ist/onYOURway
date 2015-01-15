define([
    'services/app',
    'services/tell',
    'services/map/placesLayer'
], function (app, tell, placesLayer) {

    var self = {
        setSiteCollectorMarker: setSiteCollectorMarker
    };
    return self;


    /**
     *  function _setSiteCollectorMarker is subscribed
     *   - as click-handler for the map during map initialization (only if location.siteCollectorMode is active)
     *   - to the siteCollectorCoords observable
     * @method  _setSiteCollectorMarker
     * @param {object} geo The geolocation
     * @param {boolean} [updateCoords=false] if true, update the siteCollectoreCoords observable
     */
    function setSiteCollectorMarker(geo, updateCoords) {
        var location = self.location;
        if (!location.siteCollectorMarker) {
            // create new marker, if none exists
            location.siteCollectorMarker = L.marker(geo.coords ? [geo.coords[1], geo.coords[0]] : geo, {
                dragable: true,
                prefix: "fa",
                title: "New Entry",
                icon: placesLayer.getLocationIcon(false, true)
            });
            location.siteCollectorMarker.addTo(location.map);
            location.siteCollectorMarker.dragging.enable();
            location.siteCollectorMarker.on("dragend", function () {
                location.siteCollectorCoords(location.siteCollectorMarker.getLatLng());
            });
        } else {
            location.siteCollectorMarker.setLatLng(geo.coords ? [geo.coords[1], geo.coords[0]] : geo);
        }
        if (updateCoords) {
            location.siteCollectorCoords(location.siteCollectorMarker.getLatLng());
        }
        location.panIntoView(location.siteCollectorMarker);
        return location.siteCollectorMarker;
    }


});
