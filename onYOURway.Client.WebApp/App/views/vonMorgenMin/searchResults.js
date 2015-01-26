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
                selectedItemSubscription = placesLayer.selectedItem.subscribe(scrollIntoView);
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

        function scrollIntoView() {
            var id = placesLayer.selectedItem() && placesLayer.selectedItem().Id();
            if (id) {
                var itm = $placesList.find('#'+id);
                var offset = Math.round(itm.offset().left);
                var width = $placesList.width();
                var itmWidth = itm.width();
                if (offset > width - itmWidth + 20) {
                    $placesList.scrollLeft($placesList.scrollLeft() + offset - width + itmWidth);
                } else if (offset < -20) {
                    $placesList.scrollLeft($placesList.scrollLeft() + offset);
                }
            }
        }


    };
    return vm;

});
