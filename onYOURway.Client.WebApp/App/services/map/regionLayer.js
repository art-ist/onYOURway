define([
    'services/tell',
    'services/geoUtils',
    'services/api/apiClient',
    'services/map/settings',
    'services/map/mapAdapter'
], function (tell, geoUtils, apiClient, settings, map) {

	var self = {
		regions: ko.observableArray(),
		views: ko.observable(),
		selectedRegion: ko.observable(settings.defaultRegion()),

		loadRegions: loadRegions,
		setView: setView
	};
	return self;

	function loadRegions() {
		require(['services/api/apiClient'], function (apiClient) {
			return apiClient.getRegions()
				.then(function (d) {
					var regions = d.results;
					tell.log(regions.length + " Regions found", 'regionLayer');
					self.regions(regions);
					//TODO: Set first region as default -> select default region based on  settings / current location
					setRegion(0);
				});
		});
	}

	function setRegion(index) {
		tell.log('setting region', 'regionLayer', index);
		//if (typeof index == 'undefined' || index)
		//	var regions = self.regions();
		//self.selectedRegion(regions[index]);
		//if (regions.length) {
		//	self.views(regions[index].Views());
		//	//ToDo: in Select Region auslagern?
		//	self.setView(0);
		//}
		//drawVeilOfSilence([regions[index]]); //highlight the selected region only
	}

	function setView(i) {
		tell.log('setting view', 'regionLayer', i);
		//var view = self.views()[i];
		//var box = geoUtils.wktToCoords(view.Boundary().Geography.WellKnownText);
		//map.fitBounds([[box[3][1], box[3][0]], [box[1][1], box[1][0]]]);
		map.setView(0);
		return;
	}

	function drawVeilOfSilence(regions) {
		if (!settings.showVeilOfSilence) return;
		var bounds = [
            L.GeoJSON.coordsToLatLngs([[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]])
		];
		for (var i = 0; i < regions.length; i++) {
			var wkt = regions[i].Boundary().Geography.WellKnownText;
			var coords = geoUtils.wktToCoords(wkt);
			var latLngs = L.GeoJSON.coordsToLatLngs(coords);
			bounds.push(latLngs);
		}
		//overlay-pane
		var mPoly = L.polygon(bounds, {
			color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#000000", fillOpacity: 0.15, clickable: false
			//color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#ffffff", fillOpacity: 1, clickable: false
		});
		map.addLayer(mPoly);
	}

});
