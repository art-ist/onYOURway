define([
  'plugins/router',
  'services/tell',
  'services/api/placeSearch',
  'services/api/searchSuggestions',
  'text!components/searchBox-component.html'
],
function (router, tell, placeSearch, searchSuggestions, template) {

    function SearchBoxViewModel(params) {
        // private members
        var self = this;

        // public interface
        this.searchTerm = placeSearch.searchTerm;
        this.searchSuggestionObjects = searchSuggestions.cachedObjects
        this.selectedValue = ko.observable('');
        this.formatSearchSuggestion = formatSearchSuggestion;
        this.formatSelection = formatSelection;
        this.createSearchChoice = createSearchChoice;
        this.selectionChangedEvent = selectionChangedEvent;
        this.triggerSearch = triggerSearch;

        // private functions

        function formatSearchSuggestion(suggestion) {
            return '<div class="searchBoxSuggestion">'
                   + formatSearchSuggestionImage(suggestion)
                   + formatSearchSuggestionTitle(suggestion)
                   + formatSearchSuggestionSubtitle(suggestion)
                   + '<div class="clearFloat"></div></div>'
        }

        function formatSearchSuggestionImage(suggestion) {
            if (suggestion.ThumbnailUrl)
                return '<img src="'
                        + suggestion.ThumbnailUrl
                        + '" onerror="this.style.visibility=\'hidden\'"/>';
            else
                return '';
        }

        function formatSearchSuggestionTitle(suggestion) {
            return '<span>' + suggestion.Name + '</span>';
        }

        function formatSearchSuggestionSubtitle(suggestion) {
            if (suggestion.Subtitle)
                return '<span class="subtitle">' + suggestion.Subtitle + '</span>';
            else
                return '';
        }

        function formatSelection(suggestion) {
            return suggestion.Name;
        }

        function createSearchChoice(query) {
            return { Id: '_new_', Name: query };
        }

        function selectionChangedEvent(viewModelInstance, event) {
            self.triggerSearch();
        }

        function triggerSearch() {
            var searchTerm = placeSearch.searchTerm();
            if (searchTerm) {
                placeSearch.search(decodeURI(searchTerm));
                router.navigate('#search/' +  encodeURI(searchTerm));
            }
        }

    };

    return { viewModel: SearchBoxViewModel, template: template };

});
