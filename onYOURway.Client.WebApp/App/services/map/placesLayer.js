define([
    'services/tell',
    'services/api/places',
    'services/map/settings',
    'services/map/mapAdapter'
], function (tell, places, settings, map) {
    var location;
    var placesMapLayer = null;

    var self = {
        initialize: initialize,
        selectedItem: ko.observable(),
        selectedItems: ko.observableArray(),

        drawMarkers: drawMarkers,
        setMarker: setMarker,
        itemClick: itemClick
    };
    return self;

    function initialize(pLocation) {
        location = pLocation;
    }

    function drawMarkers(placesToDraw) {
        if (placesMapLayer) map.removeLayer(placesMapLayer);
        var group = settings.clusterLocations()
            ? new L.MarkerClusterGroup()
            : new L.LayerGroup();
        map.addLayer(group);
        placesMapLayer = group;

        for (var i = 0; i < placesToDraw.length; i++) {
            //console.log("[location] drawMarkers drawing marker ", placesToDraw[i])
            setMarker(group, null, placesToDraw[i]);
        }

        //if(location.settings.zoomToSearchResults()) {
        //  map.fitBounds(group.getBounds());
        //}
    }

    function setMarker(group, marker, loc) {
        if (!loc.coords) return;

        var add = !marker ? true : false;
        if (add) {
            marker = new L.Marker({ prefix: "fa" });
        }
        //var coords = loc.Position.Geography.WellKnownText.replace(/POINT \(/, '').replace(/\)/, '').split(' ');
        var latLong = [loc.coords[1], loc.coords[0]];
        marker.options.title = loc.Name();
        marker.setLatLng(latLong);
        marker.setIcon(getLocationIcon(loc));
        marker.setOpacity(loc.isOpen() ? 1 : 0.3);

        //store refeences
        marker.data = loc;
        loc.marker = marker;

        if (add) {
            group.addLayer(marker);
            marker
                .on({
                    //mouseover: _itemMouseOver,
                    //mouseout: _itemMouseOut,
                    click: itemClick
                });
            //.bindPopup('<b>' + loc.Name() + '</b><br/>' + loc.Street);
        }
    }

    function getLocationIcon(loc, selected) {
        return L.AwesomeMarkers.icon({
            icon: loc.Icon ? loc.Icon() : null,
            prefix: 'fa',
            markerColor: selected ? "cadetblue"
                : loc.isFeatured() ? "green"
                : "orange"
        });
    }

    function itemClick(e) {
        var oldLoc = self.selectedItem();

        //get new marker and loc(ation)
        var marker, loc;
        if (e.target) { //marker ... loc in e.target.data
            marker = e.target;
            loc = e.target.data;
        }
        else if (e.marker) { //bound item (e.g. locationList) ... marker in e.marker
            marker = e.marker;
            loc = e;
        }

        //if already selected toggle details and return
        if (oldLoc === loc) {
            location.toggleDetails();
        }
        else {
            //restore marker of formerly selected item
            if (oldLoc) {
                oldLoc.marker
                    .setIcon(getLocationIcon(oldLoc))
                    .setZIndexOffset(0)
                    .setOpacity(oldLoc.isOpen() ? 1 : 0.3)
                ;
            }
            //select new item
            self.selectedItem(loc);
            //highlight new marker
            marker
                .setIcon(getLocationIcon(loc, true))
                .setZIndexOffset(10000)
                .setOpacity(loc.isOpen() ? 1 : 0.8)
            ;
        }

        var selItmsIdx = self.selectedItems.indexOf(loc);
        if (selItmsIdx >= 0) {
            self.selectedItems.splice(selItmsIdx, 1);
        }
        self.selectedItems.unshift(loc);
        if (self.selectedItems().length > settings.maxSelectedItems) {
            self.selectedItems.pop();
        }

        map.panIntoView(marker);
    }

});
