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
                if (category.Name && category.Name.length > 5 && category.Name.substr(0,5) == 'Initi') {
                    result['initiatives'] = true;
                }
                if (category.Name && category.Name.length > 5 && category.Name.substr(0,5) == 'Event') {
                    result['events'] = true;
                }
                if (category.Name && category.Name.length > 5 && category.Name.substr(0,5) == 'Unter') {
                    result['companies'] = true;
                }
                return result;
            }

            self.toggleTag = function(tag) {
                tag.active(!tag.active());
                if (tag.active()) {
                    //TODO: use a second hidden 'filter by tag' array variable inside the placeSearch instead of replacing the search term!!
                    placeSearch.searchTerm(tag.Name ? tag.Name : tag.name.length ? tag.name[0].Name : tag.name.Name)
                }
            };

            self.toggleCategory = function(cat) {
                if (params && (params.toggleTagSelectionOpen === false) ) {



                } else {

                    settings.showTagSelection(!settings.showTagSelection());

                }
            };

            self.shorten = function(name) {
                if (name) {
                    var idx = name.indexOf(' ');
                    if (idx < 0 || idx == 0) {
                        return name;
                    }
                    return name.substr(0, idx);
                } else {
                    return name;
                }
            }



        };

        return { viewModel: SearchBoxViewModel, template: template };

    });
