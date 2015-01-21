define([
    'services/tell',
    'services/geoUtils',
    'services/api/apiClient'
], function (tell, geoUtils, apiClient) {

    var self = {
        allPlaces: ko.observableArray(),
        loadPlaces: loadPlaces
    };
    return self;

    function loadPlaces(location) {
        require(['services/app'], function (app) {
            var query = breeze.EntityQuery.from("Places");
            query.parameters = {
                RegionId: location.region && location.region() ? location.region().Id() : 1,
                Lang: app.lang()
            };

            return apiClient.locateContext
                .executeQuery(query)
                .then(function (d) {
                    if (d.results) {
                        var places = ko.mapping.fromJS(d.results[0].Places.Place)();
                        //tell.log('places found', 'location - _loadPlaces', places);

                        //extend places
                        //$.each(places, function (i, item) {
                        places.forEach(function (item) {
                            if (item.Position && item.Position().startsWith("POINT")) item.coords = item.Position().replace(/POINT \(/, '').replace(/\)/, '').split(' ');

                            //** opening_hours **
                            if (item.oh === undefined && item.OpeningHours && item.OpeningHours()) {
                                try {
                                    item.oh = new opening_hours(item.OpeningHours(), {
                                        //initialize opening_hours property
                                        //TODO: move definition to locate property
                                        //TODO: get from start or center of map or region (but actually not used as long as nobody uses sunrise/sunset and, oh, holidays)
                                        "place_id": "97604310",
                                        "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
                                        "osm_type": "relation",
                                        "osm_id": "77189",
                                        "lat": "48.2817813",
                                        "lon": "15.7632457",
                                        "display_name": "Niederösterreich, Österreich",
                                        "address": {
                                            "state": "Niederösterreich",
                                            "country": "Österreich",
                                            "country_code": "at"
                                        }
                                    });
                                } catch (e) {
                                    tell.log('OpeningHours Error: ' + e, 'locate', item);
                                }
                            }

                            //** isOpen **
                            if (item.isOpen === undefined) {
                                item.isOpen = function () {

                                    if (!item.oh) return null;
                                    var when = ! (location.when && location.when()) || location.when() === 'jetzt' ? new Date() : location.when();
                                    return item.oh.getState(when);

                                }; // isOpen()
                            } //if (item.isOpen === undefined)

                            //** OpeningHours **
                            if (item.OpenDisplay === undefined) {
                                item.OpenDisplay = ko.computed(function () {
                                    if (!item.oh) return null;
                                    return item.oh.prettifyValue({
                                        block_sep_string: '<br/>', print_semicolon: false
                                    }).replace('Su', 'So').replace('Tu', 'Di').replace('Th', 'Do').replace('PH', 'Feiertag');
                                }); // OpenDisplay
                            } //if (item.OpenDisplay === undefined)

                            //** distance **
                            if (item.distance === undefined) {
                                if (!item.coords) return 100000000;

                                item.distance = function () {
                                    ///----------
                                    var reader = new jsts.io.WKTReader();
                                    var wkt;
                                    if (location.route && location.route.geometry && location.route.geometry.length > 0) {
                                        wkt = geoUtils.latLngToWkt(location.route.geometry, 'LINESTRING', false);
                                    }
                                    else if (location.route && location.route.start.coords())
                                        wkt = geoUtils.latLngToWkt(new L.LatLng(location.route.start.coords()[1], location.route.start.coords()[0]), 'POINT', false);
                                    else {
                                        return -1;
                                    }
                                    var to = reader.read(wkt); //including transform
                                    wkt = geoUtils.latLngToWkt(new L.LatLng(item.coords[1], item.coords[0]), 'POINT', false);
                                    var locPos = reader.read(wkt); //including transform
                                    var dist = locPos.distance(to);
                                    //console.log(item.Name() + ' - ' + dist * 1000);
                                    return dist;
                                };
                            }

                            //** isFeatured **
                            if (item.isFeatured === undefined) {
                                item.isFeatured = function () {
                                    if ((!item.Tag) || (!location.featuredIf)) return false;
                                    var _tags = ko.isObservable(item.Tag)
                                            ? item.Tag()
                                            : [item.Tag]
                                        ;
                                    for (var i = 0; i < _tags.length; i++) {
                                        for (var f = 0; f < location.featuredIf().length; f++) {
                                            if (_tags[i].Name().toLowerCase() === location.featuredIf()[f].Name().toLowerCase() && location.featuredIf()[f].Selected() === true) {
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                }; // isFeatured()
                            } // if (item.isFeatured === undefined)

                        }); //places.forEach
                    } //if (d.results)

                    //update places
                    self.allPlaces(places);

                    tell.log(places.length + ' places loaded', 'location');
                })
                .fail(function (error) {
                    var msg = breeze.saveErrorMessageService.getErrorMessage(error);
                    error.message = msg;
                    tell.error("Die Angebote der Region konnten nicht geladen werden. Sie können versuchen Sie die Seite neu aufzurufen.", 'location - _loadPlaces', error);
                    throw error;
                });
        });
    }

});