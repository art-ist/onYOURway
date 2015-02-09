/**
 * purpose of location.js:
 * 1. facade for services in the map and api subfolder, to be used by views
 * 2. mediator / director pattern, reduces direct dependencies between views and services / between services.
 *    services can be replaced by other implementations without modifying views or other services.
 */
define([
	'services/tell',
	'plugins/router',

	'services/api/apiClient',
    'services/api/places',
	'services/api/placeSearch',
	'services/api/searchSuggestions',
	'services/api/placeComparators',

	'services/map/mapAdapter',
	'services/map/settings',
    'services/map/placesLayer',
    'services/map/pointerLayer',
    'services/map/regionLayer',
    'services/map/routingLayer',
    'services/map/siteCollectorLayer',
    'services/map/tileLayer'
], function (tell, router, apiClient, places, placeSearch, searchSuggestions, placeComparators, map, settings,
			 placesLayer, pointerLayer, regionLayer, routingLayer, siteCollectorLayer, tileLayer) {

	var location = {
		settings: settings,

		searchFor: placeSearch.searchTerm, //used in view _searchoptions.html, svc placesLayer
		when: ko.observable(new Date()), //used in view _searchoptions.html, svc placesLayer
		sortBy: ko.observable(), //used in view _searchoptions.html, svc placesLayer
		featuredIf: ko.observableArray([
			{ Name: ko.observable('Bio'), Selected: new ko.observable(true) },
			{ Name: ko.observable('FairTrade'), Selected: new ko.observable(true) },
			{ Name: ko.observable('aus der Region'), Selected: new ko.observable(false) },
			{ Name: ko.observable('Eigenproduktion'), Selected: new ko.observable(false) }
		]), //used in view _searchoptions.html
		sortOptions: placeComparators, //used in view _searchoptions.html, svc placesLayer

		mapLocations: placeSearch.searchResults, //used in views _map.html, siteCollector
		selectedItem: placesLayer.selectedItem, //used by view _map.html and pointerLayer

		route: routingLayer.route, //used in view _searchoptions.html, svc placesLayer, routingLayer

		regions: regionLayer.regions, //used in view siteCollector
		region: regionLayer.selectedRegion, //used in view _nav.html
		views: regionLayer.views, //used in view _nav.html

		tileLayers: tileLayer.tileLayers, //used by view _nav.html
		activeTileLayer: tileLayer.activeLayer, //used by view _nav.html

		searchSuggestions: searchSuggestions.cachedNames, //used in view _nav.js, _nav.html, component searchBox...js
		searchSuggestionObjects: searchSuggestions.cachedObjects, //used in component searchBox...html

		//methods
		initializeMap: initializeMap, // used by view _map.html
		loadRegionFeatures: loadRegionFeatures, // used by svc mapAdapter and view siteCollector
		removePointerAndDrawMarkers: removePointerAndDrawMarkers, // used in bindingHandler ventures

		search: placeSearch.search, //used by component searchBox, svc app, views _nav.js, vonMorgen/nav.js, about/explorer.js
		showByTagName: placeSearch.showByTagName, //used by svc discover, views siteCollector, home
		itemClick: placesLayer.itemClick, // used in svc placesLayer, views _map.html, vonMorgen/_map.js, vonMorgen/_map.html

		locate: routingLayer.locate, //used in view _searchoptions.html
		setMode: routingLayer.setMode, //used by view _searchoptions.html
		getCurrentPosition: routingLayer.getCurrentPosition, //used in view _searchoptions.html

		setView: regionLayer.setView, // used in svc regionLayer, view _nav.html
		setTileLayer: tileLayer.setTileLayer, //used by svc mapAdapter and view _nav.html
		drawPointer: pointerLayer.drawPointer, //used in svc location (toggle...), svc mapAdapter (itemClick)
		panIntoView: map.panIntoView, //used in svc location (toggle,), mapAdapter (itemClick), siteCollectorLayer

		toggleMap: toggleMap, //unused
		toggleList: toggleList, //used in views _map.html, vonMorgen/_map.html
		toggleDetails: toggleDetails, //used in views _map.html, vonMorgen/_map.html, lefaletMap (itemClick)


		//TODO: verify if cachedTags / location.tags is used anywhere, otherwise delete
		tags: searchSuggestions.cachedTags,

		//TODO: baseMap used in _nav.html for menu links. move into _nav.js!
		baseMap: map.baseMap,

		//TODO: remove my/wizardNew and all its dependencies  (loactionToEdit)
		loactionToEdit: apiClient.locationToEdit,
		getLocation: apiClient.getLocation, //only used by editLocation
		editLocation: editLocation
	};
	initialize();
	return location;

	function initialize() {
		location.sortBy(location.sortOptions[0]);

		location.sortBy.subscribe(function (newValue) {
			location.mapLocations(location.mapLocations().sort(newValue.Sorter));
		});
	}

	function initializeMap(containerId) {
		map.initializeMap(containerId)
		tileLayer.setTileLayer(0);
		pointerLayer.initialize(placesLayer.selectedItem);
		siteCollectorLayer.initialize();
		routingLayer.initialize(location);
		regionLayer.loadRegions();
		loadRegionFeatures();
		placeSearch.initialize(location)
		placesLayer.initialize(location);
    }

	function loadRegionFeatures() {
	    places.loadPlaces(location);

		require(['services/app'], function (app) {
			searchSuggestions.loadSearchSuggestions(app.lang, location.region);
		});
	}

	function removePointerAndDrawMarkers(markersToDraw) {
		pointerLayer.removePointer();
		placesLayer.drawMarkers(markersToDraw);
	}

	function toggleMap(mode) {
		if (!settings.forceMap) {
			if (mode === 'hide' || settings.showMap() === 'auto')
				settings.showMap(false);
			else
				settings.showMap('auto');
		}
	}

	function toggleList(mode) {
		if ((!settings.disableDetails) || !settings.forceMap) {
			if (mode === 'hide' || settings.showList() === 'auto')
				settings.showList(false);
			else
				settings.showList('auto');
			//map.invalidateSize(true);
		}
	}

	function toggleDetails(mode) {
		if (!settings.disableDetails) {
			if (mode === 'hide' || $('#ventureDetails').hasClass('detailsOpen')) {
				pointerLayer.removePointer();
				$('#ventureDetails, #locationList, #map').removeClass('detailsOpen');
				tell.log('details hidden', 'location - toggleDetails');
				setTimeout(function () {
					map.panIntoView(placesLayer.selectedItem() && placesLayer.selectedItem().marker);
					pointerLayer.drawPointer();
				}, 500);
			}
			else {
				pointerLayer.removePointer();
				$('#ventureDetails, #locationList, #map').addClass('detailsOpen');
				tell.log('details opened', 'location - toggleDetails');
				setTimeout(function () {
					map.panIntoView(placesLayer.selectedItem() && placesLayer.selectedItem().marker);
					pointerLayer.drawPointer();
				}, 500);
			}
		}
	}

    //TODO: remove my/wizardNew and all its dependencies  (loactionToEdit)
	function editLocation(Id) {
		location
		 .getLocation(Id)
		 .then(function () {
		 	tell.log('location loaded', 'location - editLocation', location.loactionToEdit());
		 	router.navigate('my/wizardNew');
		 });
	}

});