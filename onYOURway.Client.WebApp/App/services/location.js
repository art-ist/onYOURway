define([
	'services/tell',
	'plugins/router',

	'services/api/apiClient',
	'services/api/searchSuggestions',

	'services/map/map',
    'services/map/fiveMinuteDistanceLayer',
    'services/map/placesLayer',
    'services/map/pointerLayer',
    'services/map/regionLayer',
    'services/map/routingLayer',
    'services/map/siteCollectorLayer',
    'services/map/tileLayer'
], function (tell, router, apiClient, searchSuggestions,
			 map, fiveMinuteDistanceLayer, placesLayer, pointerLayer, regionLayer, routingLayer, siteCollectorLayer, tileLayer) {

	var location = {
		map: null,

		settings: {
			mode: ko.observable("bicycle"), //supported: bicycle, foot, car  //TODO: add multi, public
			//Map Styling
			tileLayers: tileLayer.tileLayers,
			walkIn5: 330,   //meters in 5 minutes at 4 km/h
			bikeIn5: 1800,  //meters in 5 minutes at 21,6 km/h
			clusterLocations: ko.observable(false),
			zoomToSearchResults: ko.observable(true),
			mapPadding: { top: 50, right: 30, bottom: 20, left: 30 }, //px
			autoPan: ko.observable(true),

			showMap: ko.observable('auto'),
			showList: ko.observable('auto'),
			showDetails: ko.observable('auto'),
			showVeilOfSilence: true,
			showPointer: true,
			showIndicator: true,

			routeColor: '#0067a3',

			forceMap: false,
			disableDetails: false,
			maxSelectedItems: 5
		},

		regions: ko.observableArray(),
		region: ko.observable(),        //selected region
		views: ko.observableArray(),
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

		siteCollectorMode: ko.observable(), // boolean - if true, smaller map and possible to select a new location in the map by clicking or moving the siteCollectorMarker
		siteCollectorCoords: ko.observable(), // if siteCollectorMode is true: coordinates of the siteCollectorMarker

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
		getLocation:apiClient.getLocation,
		editLocation: editLocation,
		//TODO: baseMap seems to be unused, verify and delete (also the functions baseMapOpenOsm, ...)
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
			tileLayer: ko.observable(null),
			routeLayer: null,
			fiveMinutesInidcatorLayer: null,
			transportLayer: null,
			bikeLayer: null,
			locationLayer: null,
			pointerLayer: null,
			editLayer: null
		},

		//methods
		initializeMap: map.initializeMap,
		loadRegionFeatures: map.loadRegionFeatures,

		setTileLayer: map.setTileLayer,
		setMode: map.setMode,

		search: search,
		showByTagName: showByTagName,
		locate: map.locate,

		getCurrentPosition: map.getCurrentPosition,
		itemClick: map.itemClick,
		drawMarkers:placesLayer.drawMarkers,

		setView: map.setView,
		drawPointer: map.drawPointer,
		panIntoView: map.panIntoView,

		toggleMap: toggleMap,
		toggleList: toggleList,
		toggleDetails: toggleDetails

	};

	map.location = location;
	searchSuggestions.location = location;
	fiveMinuteDistanceLayer.location = location;
	placesLayer.location = location;
	pointerLayer.location = location;
	regionLayer.location = location;
	routingLayer.location = location;
	siteCollectorLayer.location = location;
	tileLayer.location = location;

	location.sortBy(location.sortOptions[0]);

	location.sortBy.subscribe(function (newValue) {
		location.mapLocations(location.mapLocations().sort(newValue.Sorter));
	});

	return location;

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
					location.panIntoView();
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
					location.panIntoView();
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