define([
    'services/app',
    'services/tell',
    'services/geoUtils',
    'services/api/apiClient',
], function (app, tell, geoUtils, apiClient) {

    var self = {
        loadRegions: loadRegions
    };
    return self;

    function loadRegions(map) {
        var query = breeze.EntityQuery.from("Regions");
        return apiClient.locateContext
            .executeQuery(query)
            .then(function (d) {
                var regions = d.results;
                tell.log(regions.length + " Regions found", 'location');
                self.location.regions(regions);
                //TODO: Set first region as default -> select default region based on  settings / current location
                setRegion(0);
            })
            .fail(function (error) {
                logger.error("Query for Regions failed: " + error.message, 'location', error);
            });
    }

    function setRegion(index) {
        var location = self.location;
        var regions = location.regions();
        tell.log('setRegion', 'location - setRegion', regions);
        location.region(regions[index]);
        if (regions.length) {
            location.views(regions[index].Views());
            //ToDo: in Select Region auslagern?
            location.setView(0);
        }
        _drawVeilOfSilence(location.map, [regions[index]]); //highlight the selected region only
    }

    function _drawVeilOfSilence(map, regions) {
        if (!self.location.settings.showVeilOfSilence) return;
        var bounds = [
            L.GeoJSON.coordsToLatLngs([[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]])
        ];
        for (var i = 0; i < regions.length; i++) {
            var wkt = regions[i].Boundary().Geography.WellKnownText;
            var coords = geoUtils.wktToCoords(wkt);
            var latLngs = L.GeoJSON.coordsToLatLngs(coords);
            bounds.push(latLngs);
        }
        //overlay-pane
        var mPoly = L.polygon(bounds, {
            color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#000000", fillOpacity: 0.15, clickable: false
            //color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#ffffff", fillOpacity: 1, clickable: false
        });
        mPoly.addTo(map);
    }


});
