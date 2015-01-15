define([
    'services/app',
    'services/tell',
    'services/api/apiClient'
], function (app, tell, apiClient) {

    var self = {
        loadSearchSuggestions: loadSearchSuggestions
    };
    return self;

    function loadSearchSuggestions() {
        var location = self.location;
        require(['services/app'], function (app) {
            var query = breeze.EntityQuery.from("SearchSuggestions");
            query.parameters = {
                RegionId: location.Region ? location.Region().Id() : 1,
                Lang: app.lang()
            };

            return apiClient.locateContext
                .executeQuery(query)
                .then(function (d) {
                    location.searchSuggestions.removeAll();
                    location.searchSuggestionObjects.removeAll();
                    $.each(d.results, function (i, item) {
                        location.searchSuggestions.push(item.Name);
                        location.searchSuggestionObjects.push(item);
                        if (item.Class === 'tag') {
                            location.tags.push(item.Name);
                        } //if
                    }); //$.each
                    //tell.log(location.searchSuggestions().length + " SearchSuggestions loaded", 'location', location.searchSuggestions());
                })
                .fail(function (error) {
                    var msg = breeze.saveErrorMessageService.getErrorMessage(error);
                    error.message = msg;
                    tell.logError("Suchvorschläge konnten nicht geladen werden.", 'location - _loadSearchSuggestions', error);
                    throw error;
                });
        });
    } //_loadSearchSuggestions


});
