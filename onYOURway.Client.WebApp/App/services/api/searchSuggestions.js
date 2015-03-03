define([
    'services/tell',
    'services/api/apiClient'
], function (tell, apiClient) {

    var self = {
        loadSearchSuggestions: loadSearchSuggestions,

        cachedNames: ko.observableArray(),
        cachedObjects: ko.observableArray(),
        //TODO: verify if cachedTags / location.tags is used anywhere, otherwise delete
        cachedTags: ko.observableArray()
    };
    return self;

    function loadSearchSuggestions(region) {
        var query = breeze.EntityQuery.from("SearchSuggestions");
        query.parameters = {
            Region: region && region() ? ko.utils.unwrapObservable(region().Id) : app.getConfigValue('region'),
            Lang: app.lang()
        };

        return apiClient.locateContext
            .executeQuery(query)
            .then(putToCache)
            .fail(function (error) {
                var msg = breeze.saveErrorMessageService.getErrorMessage(error);
                error.message = msg;
                tell.logError("Suchvorschläge konnten nicht geladen werden.", 'searchSuggestions - loadSearchSuggestions', error);
                throw error;
            });
    }

    function putToCache(apiResponse) {
        self.cachedNames.removeAll();
        self.cachedObjects.removeAll();
        self.cachedTags.removeAll();
        $.each(apiResponse.results, function (i, item) {
            self.cachedNames.push(item.Name);
            self.cachedObjects.push(item);
            if (item.Class === 'tag') {
                //TODO: verify if cachedTags / location.tags is used anywhere, otherwise delete
                self.cachedTags.push(item.Name);
            }
        });
    }

});
