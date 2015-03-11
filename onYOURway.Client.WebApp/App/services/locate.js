/**
 * purpose of locate.js:
 * 1. facade for services in the map and api subfolder, to be used by views
 * 2. mediator / director pattern, reduces direct dependencies between views and services / between services.
 *    services can be replaced by other implementations without modifying views or other services.
 */
define([
	'services/tell',						//
	'plugins/router',						//

	'services/api/apiClient',				// service proxy / script api for the locate controller
    'services/api/places',					// locations
	'services/api/placeSearch',				// search locations/places by name, category, ...
	'services/api/searchSuggestions',		// get search suggestions
	'services/api/placeComparators',		// sorting places aka. locations
	'services/api/taxonomy',				// manage taxonomy (categories former tags)

	'services/map/mapAdapter',				// map
	'services/map/settings',				// settings //TODO: move to apropriate services and app.config.js
    'services/map/placesLayer',				// map markers
    'services/map/pointerLayer',			// pointer connecting list and pin
    'services/map/regionLayer',				// region background
    'services/map/routingLayer',			// routing
    'services/map/siteCollectorLayer',		// siteCollector
    'services/map/tileLayer'				// basemap
], function (tell, router,
			 apiClient, places, placeSearch, searchSuggestions, placeComparators, taxonomy,
			 map, settings, placesLayer, pointerLayer, regionLayer, routingLayer, siteCollectorLayer, tileLayer) {

	var locate = {
		initialize: initialize,

		settings: settings,  //services/map/settings

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

		realm: '',							//set on initialize
		regions: regionLayer.regions,		//used in view siteCollector
		region: regionLayer.selectedRegion, //used in view _nav.html
		views: regionLayer.views,			//used in view _nav.html

		getRealmByKey: apiClient.getRealmByKey,
		getRealmByUri: apiClient.getRealmByUri,

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
		drawPointer: pointerLayer.drawPointer, //used in svc locate (toggle...), svc mapAdapter (itemClick)
		panIntoView: map.panIntoView, //used in svc locate (toggle,), mapAdapter (itemClick), siteCollectorLayer

		toggleMap: toggleMap, //unused
		toggleList: toggleList, //used in views _map.html, vonMorgen/_map.html
		toggleDetails: toggleDetails, //used in views _map.html, vonMorgen/_map.html, lefaletMap (itemClick)


		//TODO: verify if cachedTags / locate.tags is used anywhere, otherwise delete
		tags: searchSuggestions.cachedTags,

		//TODO: baseMap used in _nav.html for menu links. move into _nav.js!
		baseMap: map.baseMap,

		loadTaxonomy: taxonomy.loadTaxonomy,

		//TODO: remove my/wizardNew and all its dependencies  (loactionToEdit)
		loactionToEdit: apiClient.locationToEdit,
		getLocation: apiClient.getLocation, //only used by editLocation
		editLocation: editLocation
	};
	return locate;

	function initialize(realm, lang) {
		tell.log('starting initinlize', 'locate');

		locate.realm = realm;
		apiClient.initialize(realm, lang);

		locate.sortBy(locate.sortOptions[0]);
		locate.sortBy.subscribe(function (newValue) {
			locate.mapLocations(locate.mapLocations().sort(newValue.Sorter));
		});

		taxonomy.initialize(lang);
	} //initialize

	function initializeMap(containerId) {

		tell.log('starting map initialization', 'locate', { locate: locate, containerId: containerId});
		try {
			tell.log('initializing the map control', 'locate', containerId);
			map.initializeMapControl(containerId);
			tell.log('initializing setTileLayer', 'locate', containerId);
			tileLayer.setTileLayer(0);
			//tell.log('initializing regionLayer', 'locate', containerId);
			//regionLayer.loadRegions();
			//tell.log('initializing placeLayer', 'locate', containerId);
			//placesLayer.initialize(locate);
			//tell.log('initializing placeSearch', 'locate', containerId);
			//placeSearch.initialize(locate)
			//tell.log('initializing pointerLayer', 'locate', containerId);
			//pointerLayer.initialize(placesLayer.selectedItem);
			//tell.log('initializing siteCollectorLayer', 'locate', containerId);
			//siteCollectorLayer.initialize();
			//tell.log('initializing routingLayer', 'locate', containerId);
			//routingLayer.initialize(locate);
			//tell.log('calling loadRegionFeatures', 'locate', containerId);
			//loadRegionFeatures();
			//tell.log('map initialization done', 'locate', containerId);
		} catch (e) {
			tell.error(e.message, 'locate', e);
		}
	} //initializeMap

	function loadRegionFeatures() {
		places.loadPlaces(locate);

		searchSuggestions.loadSearchSuggestions(locate.region);
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
			if (mode === 'hide' || $('#locationDetails').hasClass('detailsOpen')) {
				pointerLayer.removePointer();
				$('#locationDetails, #locationList, #map').removeClass('detailsOpen');
				tell.log('details hidden', 'locate');
				setTimeout(function () {
					map.panIntoView(placesLayer.selectedItem() && placesLayer.selectedItem().marker);
					pointerLayer.drawPointer();
				}, 500);
			}
			else {
				pointerLayer.removePointer();
				$('#locationDetails, #locationList, #map').addClass('detailsOpen');
				tell.log('details opened', 'locate');
				setTimeout(function () {
					map.panIntoView(placesLayer.selectedItem() && placesLayer.selectedItem().marker);
					pointerLayer.drawPointer();
				}, 500);
			}
		}
	}

	//TODO: remove my/wizardNew and all its dependencies  (loactionToEdit)
	function editLocation(Id) {
		locate
		 .getLocation(Id)
		 .then(function () {
		 	tell.log('locatetion loaded', 'locate - editLocation', locate.loactionToEdit());
		 	router.navigate('my/wizardNew');
		 });
	}

});