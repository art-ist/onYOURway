define([
        'plugins/router',
        'services/logger',
        'services/api/placeSearch',
        'services/api/searchSuggestions',
        'text!components/tagSelection-component.html'
    ],
    function (router, logger, placeSearch, searchSuggestions, template) {

        function SearchBoxViewModel(params) {
            // private members
            var self = this;

            // public interface
            this.searchTerm = placeSearch.searchTerm;

            // private functions


        };

        return { viewModel: SearchBoxViewModel, template: template };

    });
