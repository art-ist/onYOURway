define([
  'services/logger',
  'services/app',
  'services/location',
  'text!components/searchTermInput-component.html'
],
function (logger, app, location, template) {

    function SearchTermInputViewModel(params) {
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
                var s = location.searchSuggestions();
                var data = [];
                var data2 = [];
                var i;
                for (i = 0; i < s.length; i++) {
                    if (s[i]) {
                        var idx = s[i].toLowerCase().indexOf(query.term.toLowerCase());
                        if (idx == 0) {
                            data.push({ id: s[i], text: s[i] });
                        } else if (idx > 0) {
                            data2.push({ id: s[i], text: s[i] });
                        }
                    }
                }
                for (i = 0; i < data2.length; i++) {
                    data.push(data2[i]);
                }
                query.callback({ results: data });
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

	return { viewModel: SearchTermInputViewModel, template: template };

});
