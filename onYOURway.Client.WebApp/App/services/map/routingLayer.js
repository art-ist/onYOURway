define([
    'services/app',
    'services/tell'
], function (app, tell) {

    var self = {
        setMode: setMode,
        locate: locate
    };
    return self;


    function _setRouteMarker(coord, usage) {
        var location = self.location;
        tell.log('setting ' + usage + ' to ' + JSON.stringify(coord), 'location - setMarker', location.route.start);

        var map = location.map;
        var marker, latLng, icon;
        switch (usage) {
            case 'start':
                if (location.route.start.marker) {
                    map.removeLayer(location.route.start.marker);
                }

                latLng = [coord[1], coord[0]];
                icon = L.AwesomeMarkers.icon({
                    prefix: "fa",
                    icon: "home",
                    color: "navy"
                });
                marker = L.marker(latLng);
                marker.setIcon(icon);
                marker.options.dragable = true;
                marker.options.title = "Ausgangspunkt (Start)";
                location.route.start.marker = marker;
                map.addLayer(marker);

                break;
            case 'end':
                if (location.route.end.marker) {
                    map.removeLayer(location.route.end.marker);
                }

                latLng = [coord[1], coord[0]];
                icon = L.AwesomeMarkers.icon({
                    prefix: "fa",
                    icon: "flag",
                    markerColor: "navy"
                });
                marker = L.marker(latLng);
                marker.setIcon(icon);
                marker.options.dragable = true;
                marker.options.title = "Ziel";
                location.route.end.marker = marker;
                map.addLayer(marker);
                break;
            default:
                break;
        }

    }

    function _getRoute() {
        var location = self.location;
        //TODO: add routing via stores at shopping list
        //var via = [];
        return routingProvider
            .getRoute(location.route, location.route.start.coords(), location.route.end.coords(), location.when(), location.settings.mode())
            .done(function (route) {
                var map = location.map;
                if (location.routeLayer) {
                    map.removeLayer(location.routeLayer);
                }
                location.routeLayer = L.polyline(location.route.geometry, { color: location.settings.routeColor });
                map.addLayer(location.routeLayer);
                _setFiveMinutesInidcator(location.route.geometry);
                return route;
            })
            .fail(function (err) {
                logger.error('Die Route konnte nicht berechnet werden.', 'location - locate', err);
            });
    }

    function setMode(mode) {
        var location = self.location;
        tell.log("changing mode to " + mode, 'location');
        //if no change do nothing
        if (location.settings.mode() === mode) return;

        //remove old mode overlay
        if (location.layers.bikeLayer) location.map.removeLayer(location.layers.bikeLayer);
        if (location.layers.transportLayer) location.map.removeLayer(location.layers.transportLayer);

        //set new mode
        location.settings.mode(mode);

        //show new mode overlay
        var query = null;
        switch (location.settings.mode()) {
            case "bike":
                if (location.layers.bikeLayer) {
                    location.map.addLayer(location.layers.bikeLayer);
                }
                else {
                    query = breeze.EntityQuery.from("BikeFeatures/?RegionId=1");
                    return locateContext
                        .executeQuery(query)
                        .then(function (d) {
                            var group = new L.LayerGroup();
                            var ways = d.results;
                            tell.log(ways.length + " ways found", 'location');
                            for (var i = 0; i < ways.length; i++) {
                                var way = ways[i];
                                var color;
                                switch (way.Mode()) {
                                    case 'Route': color = '#ff0000'; break;
                                    case 'Dedicated': color = '#00ff00'; break;
                                    default: color = 'ff7800'; break;
                                }
                                var poly = L.multiPolyline(
                                    L.GeoJSON.coordsToLatLngs(geoUtils.wktToCoords(way.Way().Geography.WellKnownText)),
                                    {
                                        color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: (way.Name() ? true : false)
                                    }
                                );
                                if (way.Name()) {
                                    poly.bindPopup('<b>' + way.Name() + '</b>');
                                }
                                group.addLayer(poly);
                            }
                            location.map.addLayer(group);
                            location.layers.bikeLayer = group;
                        }) //then
                        .fail(function (error) {
                            logger.error("Query for Regions failed: " + error.message, 'location', error);
                        });
                }
                break;
            case "walk":
                if (location.layers.transportLayer) {
                    location.map.addLayer(location.layers.transportLayer);
                }
                else {
                    query = breeze.EntityQuery.from("TransportFeatures/?RegionId=1");
                    return locateContext
                        .executeQuery(query)
                        .then(function (d) {
                            var group = new L.LayerGroup();
                            var lines = d.results[0].Lines;
                            tell.log(lines.length + " lines found", 'location');
                            for (var i = 0; i < lines.length; i++) {
                                var line = lines[i];
                                var color;
                                switch (line.Mode()) {
                                    case 'Route': color = '#ff0000'; break;
                                    case 'Dedicated': color = '#00ff00'; break;
                                    default: color = 'ff7800'; break;
                                }
                                var poly = L.multiPolyline(
                                    L.GeoJSON.coordsToLatLngs(geoUtils.wktToCoords(line.Way().Geography.WellKnownText)),
                                    {
                                        color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: true
                                    }
                                );
                                poly.bindPopup('<b>' + line.Name() + '</b>');
                                group.addLayer(poly);
                            }
                            location.map.addLayer(group);
                            location.layers.transportLayer = group;
                        }) //then
                        .fail(function (error) {
                            logger.error("Query for Regions failed: " + error.message, 'location', error);
                        });
                }
                break;
            //default:
            //  break;
        }

        //recalculate route
        _getRoute();

    }

    function _geoCode(searchString, writeResultTo) {
        var location = self.location;
        tell.log('geocoding: ' + searchString, 'location - geoCode');

        return geocodingProvider
            .getCoords(searchString, location.region)
            .done(function (result) {
                if (result.success) {
                    writeResultTo(result.coords);  //observable variable to write the result to (e.g. start.coords or end.coords)
                    tell.log('found: ' + JSON.stringify(result.coords), 'location - geoCode', writeResultTo);
                }
                else {
                    logger.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', result);
                }
            })
            .fail(function (err) {
                logger.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', err);
            });

    }

    function locate(what) {
        var location = self.location;
        var map = location.map;
        var start = location.route.start;
        var end = location.route.end;

        if (location.layers.fiveMinutesInidcatorLayer) {
            map.removeLayer(location.layers.fiveMinutesInidcatorLayer);
        }

        if (what === 'start' && start.text() === 'aktueller Standort') {
            getCurrentPosition();
            return;
        }
        if (what === 'start' && !start.text()) {
            logger.error('Geben Sie eine Position oder einen Startpunkt an.', 'location - locate');
            return;
        }
        if (what === 'end' && !end.text()) {
            logger.error('Geben Sie eine Zieladresse an.', 'location - locate');
            return;
        }
        if (what === 'nothing') { //start or endpoint removed
            location.route.end.text(null);
            if (location.route.end.marker) map.removeLayer(location.route.end.marker);
            if (location.routeLayer) map.removeLayer(location.routeLayer);
            if (location.route.start.coords()) { _setFiveMinutesInidcator(location.route.start.coords()) };
        }
        else if (what === 'start') { //get position of start
            _geoCode(location.route.start.text(), location.route.start.coords)	//location.route.start.coords ... passing function reference
                .done(function () {
                    _setRouteMarker(location.route.start.coords(), 'start');		//location.route.start.coords ... passing value
                    _setFiveMinutesInidcator(location.route.start.coords());
                });
        }
        else if (what === 'end') { //get position of end and calculate route
            _geoCode(location.route.end.text(), location.route.end.coords)
                .done(function () {
                    _setRouteMarker(location.route.end.coords(), 'end');
                    _getRoute(); //calls _setFiveMinutesInidcator()
                });
        }

    }


});
