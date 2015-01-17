define([
    'services/tell',
    'providers/routing-yours',
    'providers/geocode-nominatim',
    'services/geoUtils',
    'services/map/mapAdapter'
], function (tell, routingProvider, geocodingProvider, geoUtils, map) {
    var location;
    var routeLayer = null;
    var fiveMinutesIndicatorLayer = null;
    var transportLayer = null;
    var bikeLayer = null;

    var self = {
        route: {
            start: {
                text: ko.observable(),
                coords: ko.observable(),
                marker: null
            },
            end: {
                text: ko.observable(),
                coords: ko.observable(),
                marker: null
            },
            geometry: [],
            instructions: [],
            distance: null,
            duration: null
        },

        initialize: initialize,
        getCurrentPosition: getCurrentPosition,
        setMode: setMode,
        locate: locate
    };
    return self;

    function initialize(pLocation) {
        location = pLocation;
    }

    function _setRouteMarker(coord, usage) {
        tell.log('setting ' + usage + ' to ' + JSON.stringify(coord), 'location - setMarker', location.route.start);

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
        //TODO: add routing via stores at shopping list
        //var via = [];
        return routingProvider
            .getRoute(location.route, location.route.start.coords(), location.route.end.coords(), location.when(), location.settings.mode())
            .done(function (route) {
                if (routeLayer) {
                    map.removeLayer(routeLayer);
                }
                routeLayer = L.polyline(location.route.geometry, { color: location.settings.routeColor });
                map.addLayer(routeLayer);
                _setFiveMinutesInidcator(location.route.geometry);
                return route;
            })
            .fail(function (err) {
                tell.error('Die Route konnte nicht berechnet werden.', 'location - locate', err);
            });
    }

    function getCurrentPosition() {
        navigator.geolocation.getCurrentPosition( //requests current position from geolocation api (HTML5 or PhoneGap)
            function (result) {
                if (result.coords) {
                    location.route.start.coords([result.coords.longitude, result.coords.latitude]);
                    location.route.start.text('aktueller Standort');
                    _setRouteMarker(location.route.start.coords(), 'start');
                    _setFiveMinutesInidcator(location.route.start.coords());
                }
            },
            function (error) {
                tell.error(error.message, 'location-getCurrentPosition');
            },
            {
                maximumAge: 300000
            }
        );
    } //getCurrentPosition

    function _setFiveMinutesInidcator(aroundWhat) {
        tell.log('starting', 'location - _setFiveMinutesIndicator', aroundWhat);
        if (fiveMinutesIndicatorLayer) {
            map.removeLayer(fiveMinutesIndicatorLayer);
        }
        if (!location.settings.showIndicator) { return; } //don't show indicator

        var indicator = null;
        var indicatorOptions = {
            title: '5 Minuten zufuß',
            //color: 'transparent',
            stroke: false,
            fillColor: '#b8f71a', //ToDo: Move color to theme
            fillOpacity: 0.2
        };

        //if (aroundWhat[0] instanceof L.LatLng) { //aroundWhat is an array and it's first Element is a L.LatLng -> route.geometry
        if (aroundWhat[0] instanceof Array) { //aroundWhat is an array and it's first Element is also -> route.geometry

            //calculate convex hull
            var reader = new jsts.io.WKTReader();
            var writer = new jsts.io.WKTWriter();

            var wkt = geoUtils.latLngToWkt(aroundWhat, 'LINESTRING', true);
            //tell.log('wkt after geoUtils.latLngToWkt(.,.) = ', 'location - _setFiveMinutesIndicator', wkt);
            var input = reader.read(wkt); //including transform
            //tell.log('calculating Buffer for ' + JSON.stringify(input), 'location - _setFiveMinutesIndicator');
            var buffer = input.buffer(location.settings.walkIn5);
            //tell.log('jsts buffer = ', 'location - _setFiveMinutesIndicator', buffer);

            wkt = writer.write(buffer);
            //tell.log('calculated buffer', 'location - _setFiveMinutesIndicator', wkt);
            var points = geoUtils.wktToCoords(wkt); //convert 2 point array
            //tell.log('points after wktToCoords(wkt) = ', 'location - _setFiveMinutesIndicator', points);
            var latLngs = [];
            for (var i = 0; i < points.length; i++) {  //transform to spherical
                latLngs.push(geoUtils.transformXyMeterToLatLong(points[i]));
            }
            //tell.log('latLngs after point-wise transform', 'location - _setFiveMinutesIndicator', latLngs);

            indicator = L.polygon(latLngs, indicatorOptions);
            fiveMinutesIndicatorLayer = indicator;
            map.addLayer(indicator);
        }
        if (typeOf(aroundWhat[0]) === 'number' && aroundWhat.length > 1) { //ok, but it's a coordinate Pair -> position?
            var latLng = [aroundWhat[1], aroundWhat[0]];
            indicator = L.circle(latLng, location.settings.walkIn5, indicatorOptions);
            fiveMinutesIndicatorLayer = indicator;
            map.addLayer(indicator);
        }

        location.mapLocations(location.mapLocations().sort(location.sortBy().Sorter));
    } //_setFiveMinutesInidcator

    function setMode(mode) {
        tell.log("changing mode to " + mode, 'location');
        //if no change do nothing
        if (location.settings.mode() === mode) return;

        //remove old mode overlay
        if (bikeLayer) map.removeLayer(bikeLayer);
        if (transportLayer) map.removeLayer(transportLayer);

        //set new mode
        location.settings.mode(mode);

        //show new mode overlay
        var query = null;
        switch (location.settings.mode()) {
            case "bike":
                if (bikeLayer) {
                    map.addLayer(bikeLayer);
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
                            map.addLayer(group);
                            bikeLayer = group;
                        }) //then
                        .fail(function (error) {
                            tell.error("Query for Regions failed: " + error.message, 'location', error);
                        });
                }
                break;
            case "walk":
                if (transportLayer) {
                    map.addLayer(transportLayer);
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
                            map.addLayer(group);
                            transportLayer = group;
                        }) //then
                        .fail(function (error) {
                            tell.error("Query for Regions failed: " + error.message, 'location', error);
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
        tell.log('geocoding: ' + searchString, 'location - geoCode');

        return geocodingProvider
            .getCoords(searchString, location.region)
            .done(function (result) {
                if (result.success) {
                    writeResultTo(result.coords);  //observable variable to write the result to (e.g. start.coords or end.coords)
                    tell.log('found: ' + JSON.stringify(result.coords), 'location - geoCode', writeResultTo);
                }
                else {
                    tell.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', result);
                }
            })
            .fail(function (err) {
                tell.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', err);
            });

    }

    function locate(what) {
        var start = location.route.start;
        var end = location.route.end;

        if (fiveMinutesIndicatorLayer) {
            map.removeLayer(fiveMinutesIndicatorLayer);
        }

        if (what === 'start' && start.text() === 'aktueller Standort') {
            getCurrentPosition();
            return;
        }
        if (what === 'start' && !start.text()) {
            tell.error('Geben Sie eine Position oder einen Startpunkt an.', 'location - locate');
            return;
        }
        if (what === 'end' && !end.text()) {
            tell.error('Geben Sie eine Zieladresse an.', 'location - locate');
            return;
        }
        if (what === 'nothing') { //start or endpoint removed
            location.route.end.text(null);
            if (location.route.end.marker) map.removeLayer(location.route.end.marker);
            if (routeLayer) map.removeLayer(routeLayer);
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
