define([
    'services/tell',
    'services/api/apiClient',
    'services/map/settings'
], function (tell, apiClient, settings) {

	var _lang = null;

	var self = {

		initialize: initialize,

		loadTaxonomy: loadTaxonomy,
		categories: ko.observableArray([]),

    };
    return self;

    function initialize(lang) {
    	_lang = lang;
    }

    function loadTaxonomy(lang) {
        return apiClient.getTaxonomy(lang || _lang())
            .then(function (taxonomy) {
            	tell.log("taxonomy  loaded", 'taxonomy service - loadTaxonomy', taxonomy);
                self.categories(taxonomy.Categories);
                return taxonomy.Categories;

                ////TODO: move this code onto the server
                //$.each(categories, function(key, val) {
                //    val.CssClass = val.Id == 266 ? 'initiatives' : val.Id == 267 ? 'events' : 'companies';
                //    var longName = val.name.length ? val.name[0].Name : val.name.Name;
                //    val.shortName = longName.substr(0, longName.indexOf(' '));
                //    if (val.tag) {
                //        $.each(val.tag, function(k,v) {
                //            v.active = ko.observable(v.Id == 270);
                //        });
                //        val.active = ko.computed(function () {
                //                for (var i in val.tag)
                //                    if (val.tag[i].active())
                //                        return true;
                //                return false;
                //            }
                //        );
                //    } else {
                //        val.active = ko.observable(false);
                //    }
                //});
            })
			.fail(function () {

			})
    	;
    } //loadTaxonomy

});
