define([
    'services/app',
    'services/tell',
], function (app, tell) {

    var self = {
        getCurrentPosition: getCurrentPosition
    };
    return self;

    function getCurrentPosition() {
        navigator.geolocation.getCurrentPosition( //requests current position from geolocation api (HTML5 or PhoneGap)
            function (result) {
                if (result.coords) {
                    self.location.route.start.coords([result.coords.longitude, result.coords.latitude]);
                    self.location.route.start.text('aktueller Standort');
                    _setRouteMarker(location.route.start.coords(), 'start');
                    _setFiveMinutesInidcator(location.route.start.coords());
                }
            },
            function (error) {
                logger.error(error.message, 'location-getCurrentPosition');
            },
            {
                maximumAge: 300000
            }
        );
    } //getCurrentPosition

    function _setFiveMinutesInidcator(aroundWhat) {
        tell.log('starting', 'location - _setFiveMinutesIndicator', aroundWhat);
        var map = self.location.map;
        if (self.location.layers.fiveMinutesInidcatorLayer) {
            map.removeLayer(location.layers.fiveMinutesInidcatorLayer);
        }
        if (!self.location.settings.showIndicator) { return; } //don't show indicator

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
            var buffer = input.buffer(self.location.settings.walkIn5);
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
            self.location.layers.fiveMinutesIndicatorLayer = indicator;
            map.addLayer(indicator);
        }
        if (typeOf(aroundWhat[0]) === 'number' && aroundWhat.length > 1) { //ok, but it's a coordinate Pair -> position?
            var latLng = [aroundWhat[1], aroundWhat[0]];
            indicator = L.circle(latLng, self.location.settings.walkIn5, indicatorOptions);
            self.location.layers.fiveMinutesInidcatorLayer = indicator;
            map.addLayer(indicator);
        }

        self.location.mapLocations(location.mapLocations().sort(location.sortBy().Sorter));
    } //_setFiveMinutesInidcator


});
