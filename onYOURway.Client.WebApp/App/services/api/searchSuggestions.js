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
    	return apiClient.getSearchSuggestions(region)
            .then(putToCache);
    }

    function putToCache(apiResponse) {
        tell.log('loading SearchSuggestions succeeded', 'searchSuggestions', apiResponse);
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
