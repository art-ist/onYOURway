define([
    'services/api/placeSearch',
    'services/map/placesLayer',
    'services/map/settings'
], function (placeSearch, placesLayer, settings) {

    var vm = function () {
        var self = this;
        var $placesList;
        var selectedItemSubscription;
        this.searchResults = placeSearch.searchResults;
        this.selectedItem = placesLayer.selectedItem;
        this.itemClick = placesLayer.itemClick;

        self.activate = function (searchTerm) {
            if (searchTerm) {
                var sT = decodeURI(searchTerm);
                if (sT) {
                    placeSearch.searchTerm(sT);
                }
            }
            settings.showList(true);
            if (! selectedItemSubscription) {
                selectedItemSubscription = placesLayer.selectedItem.subscribe(selectedItemChanged);
            }

            return true;
        };

        self.deactivate = function() {
            settings.showList(false);
            if (selectedItemSubscription) {
                selectedItemSubscription.dispose();
                selectedItemSubscription = undefined;
            }
        }

        self.attached = function(view, parent) {
            $placesList = $(view).find('#placesList ul');
            $placesList.on('DOMMouseScroll mousewheel', scrollHorizontalWithMouseWheel);
        }

        function scrollHorizontalWithMouseWheel($evt) {
            var event = $evt.originalEvent;
            var currentLeft = $placesList.scrollLeft();
            var newLeft = currentLeft + Math.round( (event.wheelDelta && (event.wheelDelta / -2)) || (event.detail * 30) );
            $placesList.scrollLeft(newLeft);
        }

        function selectedItemChanged() {
            scrollIntoView();
        }

        function scrollIntoView() {
            var id = placesLayer.selectedItem() && placesLayer.selectedItem().Id();
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
