define([
    'services/tell',
    'services/api/apiClient',
    'services/map/settings'
], function (tell, apiClient, settings) {

    var self = {
        taxonomy: ko.observable([{name: {Name: 'loading'}, shortName: 'loading', active: ko.observable(false), CssClass: 'initiatives'}, {name: {Name: 'please'}, shortName: 'please', active: ko.observable(false), CssClass: 'events'}, {name: {Name: 'wait'}, shortName: 'wait', active: ko.observable(false), CssClass: 'companies'}]),

        loadTaxonomy: loadTaxonomy

    };
    return self;

    function loadTaxonomy() {
        apiClient.getTaxonomy(settings.defaultRegion() /*, app.lang()*/)
            .then(function (d) {
                var categories = d.results[0].tags.tag;

                //TODO: move this code onto the server
                $.each(categories, function(key, val) {
                    val.CssClass = val.Id == 266 ? 'initiatives' : val.Id == 267 ? 'events' : 'companies';
                    var longName = val.name.length ? val.name[0].Name : val.name.Name;
                    val.shortName = longName.substr(0, longName.indexOf(' '));
                    if (val.tag) {
                        $.each(val.tag, function(k,v) {
                            v.active = ko.observable(v.Id == 270);
                        });
                        val.active = ko.computed(function () {
                                for (var i in val.tag)
                                    if (val.tag[i].active())
                                        return true;
                                return false;
                            }
                        );
                    } else {
                        val.active = ko.observable(false);
                    }
                });

                tell.log("taxonomy with " + categories.length + " top level categories loaded", 'taxonomy service - loadTaxonomy', categories);
                self.taxonomy(categories);
            });

    }


});
