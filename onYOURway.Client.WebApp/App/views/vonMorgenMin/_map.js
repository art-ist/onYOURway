define([
  'services/api/places',
  'services/api/placeSearch',
  'services/api/placeComparators',
  'services/api/searchSuggestions',
  'services/taxonomy',
  'services/map/mapAdapter',
  'services/map/placesLayer',
  'services/map/tileLayer',
  'services/map/siteCollectorLayer',
  'services/map/settings'
], function (places, search, sorters, searchSuggestions, taxonomy, map, placesLayer, tileLayer, siteCollectorLayer, settings) {

  var vm = {
    searchFor: search.searchTerm,
    sortBy: ko.observable(sorters[0]),
    mapCss: {
        listOpen: ko.computed(function() {return settings.showList() === true}),
        detailsOpen: ko.computed(function() {return settings.showDetails() === true}),
        siteCollectorOpen: settings.showSiteCollector
    },

    initializeMap: initializeMap,
    searchResults: search.searchResults,
    toggleDetails: toggleDetails,
    drawMarkers: placesLayer.drawMarkers
  };
  return vm;

  function initializeMap(containerId) {
    map.initializeMap(containerId);
    tileLayer.setTileLayer(0);
    window.setTimeout(function(){map.setView([49.4, 8.7], 11)}, 1);
    places.loadPlaces(vm);
    placesLayer.initialize(vm);
    search.initialize(vm);
    searchSuggestions.loadSearchSuggestions(ko.observable('de'));
    taxonomy.loadTaxonomy(ko.observable('de'));
    siteCollectorLayer.initialize();
  }

  function toggleDetails() {

  }

});
