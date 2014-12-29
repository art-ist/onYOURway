define([
  'services/logger',
  'services/app',
  'services/location',
  'text!components/searchBox-component.html'
],
function (logger, app, location, template) {

    function SearchBoxViewModel(params) {
        // private members
        var self = this;

        // public interface
        this.location = location;
        this.selectedValue = ko.observable('');
        this.getSearchSuggestions = getSearchSuggestions;
        this.formatSearchSuggestion = formatSearchSuggestion;
        this.createSearchChoice = createSearchChoice;
        this.selectionChangedEvent = selectionChangedEvent;
        this.triggerSearch = triggerSearch;

        // private functions

        function getSearchSuggestions(query) {
            if (query && query.term) {
                var allSuggestions = location.searchSuggestions();
                var matchingSuggestions = [];
                var bottomSuggestions = [];
                for (var i = 0; i < allSuggestions.length; i++) {
                    if (allSuggestions[i]) {
                        var idx = allSuggestions[i].toLowerCase().indexOf(query.term.toLowerCase());
                        if (idx == 0) {
                            matchingSuggestions.push({ id: allSuggestions[i], text: allSuggestions[i] });
                        } else if (idx > 0) {
                            bottomSuggestions.push({ id: allSuggestions[i], text: allSuggestions[i] });
                        }
                    }
                }
                for (var i = 0; i < bottomSuggestions.length; i++) {
                    matchingSuggestions.push(bottomSuggestions[i]);
                }
                query.callback({ results: matchingSuggestions });
            }
        }

        function formatSearchSuggestion(suggestion) {
                return suggestion.text;
        }

        function createSearchChoice(query) {
            return { id: '_new_', text: query };
        }

        function selectionChangedEvent(viewModelInstance, event) {
            self.triggerSearch();
        }

        function triggerSearch() {
            location.search(location.searchFor());
        }

    };

    return { viewModel: SearchBoxViewModel, template: template };

});
