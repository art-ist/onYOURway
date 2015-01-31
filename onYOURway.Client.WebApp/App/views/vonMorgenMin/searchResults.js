define([
    'services/api/placeSearch',
    'services/map/mapAdapter',
    'services/map/placesLayer',
    'services/map/settings'
], function (placeSearch, map, placesLayer, settings) {

    var vm = function () {
        var self = this;
        var $placesList;
        var selectedPlaceSubscription;
        self.searchResults = placeSearch.searchResults;
        self.selectedPlace = placesLayer.selectedItem;
        self.placeClick = placesLayer.itemClick;

        self.activate = function (searchTerm) {
            if (searchTerm) {
                var sT = decodeURI(searchTerm);
                if (sT) {
                    placeSearch.searchTerm(sT);
                }
            }
            settings.showList(true);
            if (! selectedPlaceSubscription) {
                selectedPlaceSubscription = self.selectedPlace.subscribe(selectedPlaceChanged);
            }

            return true;
        };

        self.deactivate = function() {
            settings.showList(false);
            settings.showDetails(false);
            if (selectedPlaceSubscription) {
                selectedPlaceSubscription.dispose();
                selectedPlaceSubscription = undefined;
            }
        }

        self.attached = function(view, parent) {
            $placesList = $(view).find('#placesList ul');
            $placesList.on('DOMMouseScroll mousewheel', scrollHorizontalWithMouseWheel);
        }


        self.getRatings = function(place) {
            return [
                {name:"Vielfältig",  css: 'divers', value:0.8},
                {name:"Erneuerbar",  css: 'eco', value:0.7},
                {name:"Fair",        css: 'fair', value:0.85},
                {name:"Menschlich",  css: 'human', value:0.65},
                {name:"Transparent", css: 'open', value:0.9},
                {name:"Solidarisch", css: 'social', value:0.75}
            ];
        }

        //TODO: refactor and move into place / location entity
        self.getSubtitle = function(place) {
            return (place && place.Title && place.Title()) || (place && place.Tag && joinTags(place.Tag()))
        }

        function joinTags(tags) {
            var result = '';
            for (var t in tags) {
                result += (tags[t].Name && (tags[t].Name() + ' ')) || '';
            }
            return result;
        }

        function scrollHorizontalWithMouseWheel($evt) {
            var event = $evt.originalEvent;
            var currentLeft = $placesList.scrollLeft();
            var newLeft = currentLeft + Math.round( (event.wheelDelta && (event.wheelDelta / -2)) || (event.detail * 30) );
            $placesList.scrollLeft(newLeft);
        }

        function selectedPlaceChanged() {
            scrollIntoView();
            if (self.selectedPlace()) {
                if (settings.showDetails() !== true) {
                    /* map size changes when details are shown. This is animated and takes 500ms */
                    window.setTimeout(function () {
                        map.panIntoView(self.selectedPlace().marker)
                    }, 500);
                    settings.showDetails(true);
                }
            } else  {
                settings.showDetails(false);
            }
        }

        function scrollIntoView() {
            var id = self.selectedPlace() && self.selectedPlace().Id();
            if (id) {
                var $itm = $placesList.find('#'+id);
                var offsetChange = Math.round($itm.offset().left);
                if (offsetChange > 0) {
                    /* only scroll as far as necessary to get it into visible area */
                    offsetChange -=  Math.min(offsetChange, $placesList.width() - $itm.width());
                }
                if (offsetChange < -20 || offsetChange > 20) {
                    $placesList.animate({scrollLeft: $placesList.scrollLeft() + offsetChange}, 300);
                } else if (window.chrome) {
                    /* workaround chrome bug - chrome does not repaint correctly until scroll */
                    $placesList.scrollLeft($placesList.scrollLeft() + 1);
                    window.setTimeout(function() {$placesList.scrollLeft($placesList.scrollLeft() - 1)}, 1);
                }
            }
        }


    };
    return vm;

});
