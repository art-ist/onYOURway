define([
    'services/tell',
    'services/api/apiClient',
    'services/map/settings'
], function (tell, apiClient, settings) {

	var _lang = null;

	var self = {

		initialize: initialize,

		loadTaxonomy: loadTaxonomy,
		loadCategories: loadCategories,
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

//TODO: get the clientModelExtensions working, they should add the active property
                $.each(taxonomy.Categories, function(idx, val) {
                    $.each(val.Categories, function(idx, val2) {
                        val2.active = ko.observable(false);
                    });

                    val.active = ko.computed(function() {
                       var result = false;
                        $.each(val.Categories, function(idx, val2) {
                            if (val2.active && val2.active()) {
                                result = true;
                                return;
                            }
                        });
                        return result;
                    });
                });

                self.categories(taxonomy.Categories);
                return taxonomy.Categories;
            })
    	;
    } //loadTaxonomy

    function loadCategories(lang) {
    	return apiClient.getCategories(lang || _lang())
            .then(function (categories) {
            	tell.log("categories  loaded", 'taxonomy service - loadTaxonomy', categories);
            	self.categories(categories);
            	return categories;
            })
    	;
    } //loadTaxonomy

});
