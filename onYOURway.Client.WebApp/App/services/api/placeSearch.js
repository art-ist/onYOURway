define([
    'services/tell',
    'plugins/router',
    'services/api/places',
	'services/app'
], function (tell, router, places, app) {
    var location;

    var self = {
        searchTerm: ko.observable(),
        searchResults: ko.observableArray(),

        initialize: initialize,
        showByTagName: showByTagName,
        search: search
    };
    return self;

    function initialize(pLocation) {
        location = pLocation;
        if (self.searchTerm()) {
            search(self.searchTerm());
        }
    }

    function showByTagName(what) {
        //tell.log('showByTagName: ' + what, 'location');
        self.searchTerm(what);
        if (location) try {
            var toShow;
            if (!what) {//empty search criteria -> return everything
                toShow = places.allPlaces();
            }
            else {
                what = what.toLowerCase();
                var tagList = what.split(',');
                toShow = ko.utils.arrayFilter(places.allPlaces(), function (loc) {
                    //check tags
                    if (!loc.Tag) {
                        //no Tags
                        return false;
                    }
                    else {
                        var _tags = ko.isObservable(loc.Tag)
                                ? loc.Tag()
                                : [loc.Tag]
                            ;
                        for (var it = 0; it < _tags.length; it++) {
                            if (tagList.indexOf(_tags[it].Name().toLowerCase()) !== -1) {
                                //match
                                return true;
                            }
                        }
                        //no match
                        return false;
                    }
                }); //arrayFilter
            } //else
            self.searchResults(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
            if (self.searchResults().length === 0) {
            	tell.warning(app.getMsg('nav.search.noMatch', [what]) || "Keine Treffer für '" + what + "' gefunden.", 'location - showByTagName');
            }
        } catch (e) {
            tell.error(e.message, 'location - showByTagName', e);
        }

        //router.navigate('map');
    }

    function search(what) {
        //tell.info('search: ' + what, 'location');
        self.searchTerm(what);
        if (location) try {
            var toShow;
            if (!what) { //empty search criteria -> return all ventures
                toShow = ko.utils.arrayFilter(places.allPlaces(), function (loc) {
// XXX removed this condition as it seems that the places.allPlaces (which is now filled with the LocationInfo api call) doesnt contain any stops, transports and streets anmyore, but it also doe snot have the property T fjostock 25.04.2015
                    //if (loc.T && loc.T() === 'Venture') { //return only ventures (exclude stops, transports and streets)
                        return true;
                    //}
                    //return false;
                }); //arrayFilter
            } //if (!what)
            else {
                what = what.toLowerCase();
                toShow = ko.utils.arrayFilter(places.allPlaces(), function (loc) {
                    //arrayFilter
// XXX removed this condition as it seems that the places.allPlaces (which is now filled with the LocationInfo api call) doesnt contain any stops, transports and streets anmyore, but it also doe snot have the property T fjostock 25.04.2015
                    //if (!loc.T || loc.T() !== 'Venture') { //return only ventures (exclude stops, transports and streets)
                        //return false;
                    //}
                    //check name, strasse
                    if ((loc.Name && loc.Name() && loc.Name().toLowerCase().indexOf(what) !== -1)
                        ||
                        (loc.Street && loc.Street() && loc.Street().toLowerCase().indexOf(what) !== -1)
                    ) { //substring search in name
                        return true;
                    }
                    //check aliases
                    if (loc.Alias) {
                        var _aliases = ko.isObservable(loc.Alias)
                            ? loc.Alias()
                            : [loc.Alias];
                        for (var ia = 0; ia < _aliases.length; ia++) {
                            if (_aliases[ia].Name().toLowerCase().indexOf(what) !== -1) {
                                return true;
                            }
                        }
                    }
                    //check tags
                    if (loc.Category) {
                        //tell.log('searching', 'location', loc.Tag)
                        var _tags = ko.isObservable(loc.Category)
                                ? loc.Category()
                                : [loc.Category]
                            ;
                        for (var it = 0; it < _tags.length; it++) {
                            if (_tags[it].Name().toLowerCase().indexOf(what) !== -1) {
                                return true;
                            }
                        }
                    }
                    //no match
                    return false;
                }); //arrayFilter
            } //else
            self.searchResults(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
        } catch (e) {
            tell.error(e.message, 'location - search', e);
        }

        //router.navigate('map');
    }

});
