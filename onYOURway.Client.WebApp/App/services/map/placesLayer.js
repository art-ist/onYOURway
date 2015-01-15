define([
    'services/app',
    'services/tell',
    'services/api/apiClient'
], function (app, tell, apiClient) {

    var self = {
        loadPlaces: loadPlaces,
        drawMarkers: drawMarkers,
        setMarker: setMarker,
        getLocationIcon: getLocationIcon,

        sortOptions: [
            { Name: 'nach Entfernung, offene zuerst', Sorter: compareByOpenThenByDistance },
            { Name: 'nach Entfernung, hervorgehobene zuerst', Sorter: compareByFeaturedThenByDistance },
            { Name: 'nach Entfernung', Sorter: compareByDistance },
            { Name: 'nach Name', Sorter: compareByName },
        ]
    };
    return self;

    function loadPlaces() {
        require(['services/app'], function (app) {
            var query = breeze.EntityQuery.from("Places");
            query.parameters = {
                RegionId: self.location.Region ? self.location.Region().Id() : 1,
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
                                    var when = !self.location.when() || self.location.when() === 'jetzt' ? new Date() : self.location.when();
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
                                    if (self.location.route.geometry && self.location.route.geometry.length > 0) {
                                        wkt = geoUtils.latLngToWkt(self.location.route.geometry, 'LINESTRING', false);
                                    }
                                    else if (self.location.route.start.coords())
                                        wkt = geoUtils.latLngToWkt(new L.LatLng(self.location.route.start.coords()[1], self.location.route.start.coords()[0]), 'POINT', false);
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
                                    if (!item.Tag) return false;
                                    var _tags = ko.isObservable(item.Tag)
                                            ? item.Tag()
                                            : [item.Tag]
                                        ;
                                    for (var i = 0; i < _tags.length; i++) {
                                        for (var f = 0; f < self.location.featuredIf().length; f++) {
                                            if (_tags[i].Name().toLowerCase() === self.location.featuredIf()[f].Name().toLowerCase() && self.location.featuredIf()[f].Selected() === true) {
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                }; // isFeatured()
                            } // if (item.isFeatured === undefined)

                        }); //places.forEach
                    } //if (d.results)

                    //update locations
                    self.location.locations(places);

                    tell.log(places.length + ' places loaded', 'location');
                })
                .fail(function (error) {
                    var msg = breeze.saveErrorMessageService.getErrorMessage(error);
                    error.message = msg;
                    logger.error("Die Angebote der Region konnten nicht geladen werden. Sie können versuchen Sie die Seite neu aufzurufen.", 'location - _loadPlaces', error);
                    throw error;
                });
        });
    }

    function drawMarkers(map, locationsToDraw) {
        if (self.location.layers.locationLayer) map.removeLayer(self.location.layers.locationLayer);
        if (self.location.layers.pointerLayer) map.removeLayer(self.location.layers.pointerLayer);
        var group = self.location.settings.clusterLocations()
            ? new L.MarkerClusterGroup()
            : new L.LayerGroup();
        map.addLayer(group);
        self.location.layers.locationLayer = group;

        for (var i = 0; i < locationsToDraw.length; i++) {
            //console.log("[location] drawMarkers drawing marker ", locationsToDraw[i])
            setMarker(group, null, locationsToDraw[i]);
        }

        //if(location.settings.zoomToSearchResults()) {
        //  map.fitBounds(group.getBounds());
        //}
    }

    function setMarker(group, marker, loc) {
        if (!loc.coords) return;

        var add = !marker ? true : false;
        if (add) {
            marker = new L.Marker({ prefix: "fa" });
        }
        //var coords = loc.Position.Geography.WellKnownText.replace(/POINT \(/, '').replace(/\)/, '').split(' ');
        var latLong = [loc.coords[1], loc.coords[0]];
        marker.options.title = loc.Name();
        marker.setLatLng(latLong);
        marker.setIcon(getLocationIcon(loc));
        marker.setOpacity(loc.isOpen() ? 1 : 0.3);

        //store refeences
        marker.data = loc;
        loc.marker = marker;

        if (add) {
            group.addLayer(marker);
            marker
                .on({
                    //mouseover: _itemMouseOver,
                    //mouseout: _itemMouseOut,
                    click: self.itemClick
                });
            //.bindPopup('<b>' + loc.Name() + '</b><br/>' + loc.Street);
        }
    }

    function getLocationIcon(loc, selected) {
        return L.AwesomeMarkers.icon({
            icon: loc.Icon ? loc.Icon() : null,
            prefix: 'fa',
            markerColor: selected ? "cadetblue"
                : loc.isFeatured() ? "green"
                : "orange"
        });
    }

    function compareByOpenThenByDistance(l1, l2) {
        var o1 = l1.isOpen();
        var o2 = l2.isOpen();

        if (o1 && !o2)
            return -1;
        else if (o2 && !o1)
            return 1;
        else
            return compareByDistance(l1, l2);
    }

    function compareByFeaturedThenByDistance(l1, l2) {
        var f1 = l1.isFeatured();
        var f2 = l2.isFeatured();

        if (f1 && !f2)
            return -1;
        else if (f2 && !f1)
            return 1;
        else
            return compareByDistance(l1, l2);
    }

    function compareByDistance(l1, l2) {
        if (l1.distance && l2.distance)
            return l1.distance() > l2.distance();
        else if (l1.distance)
            return -1; //only l1 has distance so set as frst
        else if (l2.distance)
            return 1; //only l2 has distance sp set l2 as first
        else
        //return 0; //if both have no distance consider equal
            return compareByName; //if both have no distance sort by name
    }

    function compareByName(l1, l2) {
        return l1.Name() > l2.Name();
    }


});
