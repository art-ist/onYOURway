define([
        'plugins/router',
        'services/tell',
        'services/api/apiClient',
        'services/api/placeSearch',
        'services/map/settings',
        'text!components/tagSelection-component.html'
    ],
    function (router, tell, apiClient, placeSearch, settings, template) {

        var categories = [
            {
                key: 'initiatives',
                name: 'Initiativen & Inspirationen',
                shortName: 'Initiativen',
                tags: [
                    {Id: 1, Name: 'unterstützen', active: ko.observable(true)},
                    {Id: 2, Name: 'basteln/bauen', active: ko.observable(false)},
                    {Id: 3, Name: 'anbauen', active: ko.observable(false)},
                    {Id: 4, Name: 'tauschen/teilen', active: ko.observable(false)},
                    {Id: 5, Name: 'lernen/lehren', active: ko.observable(false)},
                    {Id: 6, Name: 'spielen', active: ko.observable(false)},
                    {Id: 7, Name: 'wohnen', active: ko.observable(false)},
                    {Id: 8, Name: 'treffen', active: ko.observable(false)}
                ]
            },
            {
                key: 'events',
                name: 'Events & Begegnungen',
                shortName: 'Events',
                tags: [
                    {Id: 9, Name: 'Vorträge/Lesungen', active: ko.observable(false)},
                    {Id: 10, Name: 'Workshops', active: ko.observable(false)},
                    {Id: 11, Name: 'Tagungen/Konferenzen', active: ko.observable(false)},
                    {Id: 12, Name: 'Offene Tür', active: ko.observable(false)},
                    {Id: 13, Name: 'Reisen/Ausflüge', active: ko.observable(false)},
                    {Id: 14, Name: 'Festivals', active: ko.observable(false)},
                    {Id: 15, Name: 'Konzerte/Kino/Theater', active: ko.observable(false)}
                ]
            },
            {
                key: 'companies',
                name: 'Unternehmen & Einkaufen',
                shortName: 'Unternehmen',
                tags: [
                    {Id: 16, Name: 'Lebensmittel', active: ko.observable(false)},
                    {Id: 17, Name: 'Kleidung', active: ko.observable(false)},
                    {Id: 18, Name: 'Elektronik', active: ko.observable(false)},
                    {Id: 19, Name: 'Beratung', active: ko.observable(false)},
                    {Id: 20, Name: 'Lorem', active: ko.observable(false)},
                    {Id: 21, Name: 'Ipsum', active: ko.observable(false)}
                ]
            }
        ];

        categories[0].active = ko.computed(function() {return getCategoryActive(categories[0])});
        categories[1].active = ko.computed(function() {return getCategoryActive(categories[1])});
        categories[2].active = ko.computed(function() {return getCategoryActive(categories[2])});

        function getCategoryActive(cat) {
            for (var i in cat.tags)
                if (cat.tags[i].active())
                    return true;
            return false;
        }

        function SearchBoxViewModel(params) {
            // private members
            var self = this;

            // public interface
            self.showTagSelection = settings.showTagSelection;
            self.categories = categories;
            self.taxonomy = ko.observable();
            getTaxonomy();

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


            function getTaxonomy() {
                apiClient.getTaxonomy(settings.defaultRegion() /*, app.lang()*/)
                    .then(function (d) {
                        tell.log(d.results.length + " taxonomy loaded", 'siteCollector - binding', d.results);
                        var categories = d.results[0].tags.tag;

                        //TODO: move this code onto the server or the apiClient!
                        $.each(categories, function(key, val) {
                            val.CssClass = val.Id == 266 ? 'initiatives' : val.Id == 267 ? 'events' : 'companies';
                            var longName = val.name.length ? val.name[0].Name : val.name.Name;
                            val.shortName = longName.substr(0, longName.indexOf(' '));
                            if (val.tag) {
                                $.each(val.tag, function(k,v) {
                                    v.active = ko.observable(v.Id == 270);
                                });
                                val.active = ko.computed(function () {
                                        for (var i in val.tag)
                                            if (val.tag[i].active())
                                                return true;
                                        return false;
                                    }
                                );
                            } else {
                                val.active = ko.observable(false);
                            }
                        });

                        self.taxonomy(categories);
                    })
            }

        };

        return { viewModel: SearchBoxViewModel, template: template };

    });
