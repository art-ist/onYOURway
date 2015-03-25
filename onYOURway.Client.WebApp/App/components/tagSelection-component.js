define([
        'plugins/router',
        'services/tell',
        'services/api/apiClient',
        'services/api/placeSearch',
        'services/map/settings',
        'services/taxonomy',
        'text!components/tagSelection-component.html'
    ],
    function (router, tell, apiClient, placeSearch, settings, taxonomy, template) {

        var taxonomy = ko.observable();

        function SearchBoxViewModel(params) {
            // private members
            var self = this;

            self.showTagSelection = settings.showTagSelection;
            self.taxonomy = taxonomy;


            self.getCategoryCss = function (category) {
                var result = {
                    active: category.active
                };
                result[category.CssClass] = true;
                return result;
            }

            self.toggleTag = function(tag) {
                tag.active(!tag.active());
                if (tag.active()) {
                    //TODO: use a second hidden 'filter by tag' array variable inside the placeSearch instead of replacing the search term!!
                    placeSearch.searchTerm(tag.name.length ? tag.name[0].Name : tag.name.Name)
                }
            };

            self.toggleCategory = function(cat) {
                if (params && (params.toggleTagSelectionOpen === false) ) {



                } else {

                    settings.showTagSelection(!settings.showTagSelection());

                }
            };



        };

        return { viewModel: SearchBoxViewModel, template: template };

    });
