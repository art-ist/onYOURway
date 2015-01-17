/**
 * purpose of location.js:
 * 1. facade for services in the map and api subfolder, to be used by views
 * 2. mediator / director pattern, reduces direct dependencies between views and services / between services.
 *    services can be exchanged without modifying views or other services.
 */
define([
	'services/tell',
	'plugins/router',

	'services/api/apiClient',
	'services/api/searchSuggestions',

	'services/map/mapAdapter',
	'services/map/settings',
    'services/map/placesLayer',
    'services/map/pointerLayer',
    'services/map/regionLayer',
    'services/map/routingLayer',
    'services/map/siteCollectorLayer',
    'services/map/tileLayer'
], function (tell, router, apiClient, searchSuggestions, map, settings,
			 placesLayer, pointerLayer, regionLayer, routingLayer, siteCollectorLayer, tileLayer) {

	var location = {
		map: null, //used by routingLayer, view siteCollector.js. was used by: view _map.html, svc placesLayer, regionLayer

		settings: settings,

		regions: regionLayer.regions,
		region: regionLayer.selectedRegion,
		views: map.views,
		locations: ko.observableArray(),
		mapLocations: ko.observableArray(),
		searchSuggestions: searchSuggestions.cachedNames,
		searchSuggestionObjects: searchSuggestions.cachedObjects,

		//TODO: verify if cachedTags / location.tags is used anywhere, otherwise delete
		tags: searchSuggestions.cachedTags,
		getTaxonomy: apiClient.getTaxonomy,
		getCountries: apiClient.getCountries,

		selectedItem: ko.observable(), //current location
		selectedItems: ko.observableArray(), //last selected locations (max: settings.maxSelectedItems)

		siteCollectorMode: siteCollectorLayer.isEnabled,
		siteCollectorCoords: siteCollectorLayer.markerGeoLocation,

		searchFor: ko.observable(),
		featuredIf: ko.observableArray([
		  { Name: ko.observable('Bio'), Selected: new ko.observable(true) },
		  { Name: ko.observable('FairTrade'), Selected: new ko.observable(true) },
		  { Name: ko.observable('aus der Region'), Selected: new ko.observable(false) },
		  { Name: ko.observable('Eigenproduktion'), Selected: new ko.observable(false) }
		]),
		sortBy: ko.observable(),
		sortOptions: placesLayer.sortOptions,

		context: apiClient.locateContext,

	    //TODO: remove my/wizardNew and all its dependencies  (loactionToEdit)
		loactionToEdit: apiClient.locationToEdit,
		getLocation: apiClient.getLocation,
		editLocation: editLocation,

		//TODO: baseMap used in _nav.html for menu links. move into _nav.js!
		baseMap: map.baseMap,

		//position: new ko.observable(),
		route: {
			start: {
				text: ko.observable(),
				coords: ko.observable(),
				marker: null
			},
			end: {
				text: ko.observable(),
				coords: ko.observable(),
				marker: null
			},
			geometry: [],
			instructions: [],
			distance: null,
			duration: null
		},
		when: ko.observable(new Date()),

		//--Layergroups:
		layers: {
			tileLayer: ko.observable(),
			routeLayer: null,
			fiveMinutesIndicatorLayer: null,
			transportLayer: null,
			bikeLayer: null,
			locationLayer: null,
			pointerLayer: null, //used by placesLayer (drawMarkers)
			editLayer: null
		},

		//methods
		initializeMap: initializeMap, // used by view _map.html
		loadRegionFeatures: loadRegionFeatures, // used by svc leafletMap and view siteCollector

		setTileLayer: setTileLayer, //used by svc leafletMap and view _nav.html
		setMode: routingLayer.setMode, //used by view _searchoptions.html

		search: search, //used by component searchBox, svc app, views _nav.js, vonMorgen/nav.js, about/explorer.js
		showByTagName: showByTagName, //used by svc discover, views siteCollector, home
		locate: routingLayer.locate, //used in view _searchoptions.html

		getCurrentPosition: routingLayer.getCurrentPosition, //used in view _searchoptions.html
		itemClick: placesLayer.itemClick, // used in svc placesLayer, views _map.html, vonMorgen/_map.js, vonMorgen/_map.html
		drawMarkers:placesLayer.drawMarkers, // used in bindingHandler ventures

		setView: regionLayer.setView, // used in svc regionLayer, view _nav.html
		drawPointer: pointerLayer.drawPointer, //used in svc location (toggle...), svc leafletMap (itemClick)
		panIntoView: map.panIntoView, //used in svc location (toggle,), leafletMap (itemClick), siteCollectorLayer

		toggleMap: toggleMap, //unused
		toggleList: toggleList, //used in views _map.html, vonMorgen/_map.html
		toggleDetails: toggleDetails //used in views _map.html, vonMorgen/_map.html, lefaletMap (itemClick)

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
		location.map = map.initializeMap(containerId)

		setTileLayer(0);
		pointerLayer.initialize(location.selectedItem);
		siteCollectorLayer.initialize();
		routingLayer.initialize(location);
		regionLayer.loadRegions();
		loadRegionFeatures();
	}

	function loadRegionFeatures() {
		placesLayer.loadPlaces(location);

		require(['services/app'], function (app) {
			searchSuggestions.loadSearchSuggestions(app.lang, location.region);
		});
	}

	function setTileLayer(index) {
		var oldLayer = location.layers.tileLayer();
		var newLayer = tileLayer.tileLayers[index].Layer;
		map.replaceLayer(oldLayer, newLayer);
		location.layers.tileLayer(newLayer);
	}

	//like search but only by full TagNames
	function showByTagName(what) {
		//tell.log('showByTagName: ' + what, 'location');
		location.searchFor(what);
		try {
			var toShow;
			if (!what) {//empty search criteria -> return everything
				toShow = location.locations();
			}
			else {
				what = what.toLowerCase();
				var tagList = what.split(',');
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					//check tags
					if (!loc.Tag) {
						//no Tags
						return false;
					}
					else {
						var _tags = ko.isObservable(loc.Tag)
								  ? loc.Tag()
								  : [loc.Tag]
						;
						for (var it = 0; it < _tags.length; it++) {
							if (tagList.indexOf(_tags[it].Name().toLowerCase()) !== -1) {
								//match
								return true;
							}
						}
						//no match
						return false;
					}
				}); //arrayFilter
			} //else
			location.mapLocations(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
			if (location.mapLocations().length === 0) {
				logger.warn("Keine Treffer für '" + what + "' gefunden.", 'location - showByTagName');
			}
		} catch (e) {
			logger.error(e.message, 'location - showByTagName', e);
		}

		router.navigate('map');
	}

	function search(what) {
		//logger.info('search: ' + what, 'location');
		location.searchFor(what);
		try {
			var toShow;
			if (!what) { //empty search criteria -> return all ventures
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					if (loc.T && loc.T() === 'Venture') { //return only ventures (exclude stops, transports and streets)
						return true;
					}
					return false;
				}); //arrayFilter
			} //if (!what)
			else {
				what = what.toLowerCase();
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					//arrayFilter
					if (!loc.T || loc.T() !== 'Venture') { //return only ventures (exclude stops, transports and streets)
						return false;
					}
					//check name, strasse
					if ((loc.Name && loc.Name() && loc.Name().toLowerCase().indexOf(what) !== -1)
						||
						(loc.Street && loc.Street() && loc.Street().toLowerCase().indexOf(what) !== -1)
					   ) { //substring search in name
						return true;
					}
					//check aliases
					if (loc.Alias) {
						var _aliases = ko.isObservable(loc.Alias)
									 ? loc.Alias()
									 : [loc.Alias];
						for (var ia = 0; ia < _aliases.length; ia++) {
							if (_aliases[ia].Name().toLowerCase().indexOf(what) !== -1) {
								return true;
							}
						}
					}
					//check tags
					if (loc.Tag) {
						//tell.log('searching', 'location', loc.Tag)
						var _tags = ko.isObservable(loc.Tag)
								  ? loc.Tag()
								  : [loc.Tag]
						;
						for (var it = 0; it < _tags.length; it++) {
							if (_tags[it].Name().toLowerCase().indexOf(what) !== -1) {
								return true;
							}
						}
					}
					//no match
					return false;
				}); //arrayFilter
			} //else
			location.mapLocations(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
		} catch (e) {
			logger.error(e.message, 'location - search', e);
		}

		router.navigate('map');
	}

	function toggleMap(mode) {
		if (!location.settings.forceMap) {
			if (mode === 'hide' || location.settings.showMap() === 'auto')
				location.settings.showMap(false);
			else
				location.settings.showMap('auto');
		}
	}

	function toggleList(mode) {
		if ((!location.settings.disableDetails) || !location.settings.forceMap) {
			if (mode === 'hide' || location.settings.showList() === 'auto')
				location.settings.showList(false);
			else
				location.settings.showList('auto');
			//location.map.invalidateSize(true);
		}
	}

	function toggleDetails(mode) {
		if (!location.settings.disableDetails) {
			if (mode === 'hide' || $('#ventureDetails').hasClass('detailsOpen')) {
				location.drawPointer('hide');
				$('#ventureDetails, #locationList, #map').removeClass('detailsOpen');
				tell.log('details hidden', 'location - toggleDetails');
				setTimeout(function () { //500ms later
					location.panIntoView(location.selectedItem() && location.selectedItem().marker);
					location.drawPointer();
					//map.panBy([0, 0]);
				}, 500);
			}
			else {
				location.drawPointer('hide');
				$('#ventureDetails, #locationList, #map')
				  .addClass('detailsOpen');
				tell.log('details opened', 'location - toggleDetails');
				setTimeout(function () { //500ms later
					location.panIntoView(location.selectedItem() && location.selectedItem().marker);
					location.drawPointer();
					//location.map.panBy([0, 0]);
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