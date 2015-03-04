define([
  'services/app',
  'services/locate',
  'services/tell',
  'services/platform'
], function (app, location, tell, platform) {

  var vm = {
    app: app,
    location: location,

    //#region lifecycle events

    //self.activate = function () {
    //  tell.log('[Map] View activated', self.title);
    //  return true;
    //};

    //self.attached = function () {
    //  tell.log('View attached', 'Map', $('#map'));
    //  //if (!location.map) {
    //  //  self.location.initializeMap('map');
    //  //}
    //};

    //#endregion lifecycle events

    //#region control display of map-parts

    //#region Properties

    showMap: true,

    showList: false,

    showDetails: false,

    showSiteCollector: location.settings.showSiteCollector,

    showInfo: ko.observable(false),
    showEco: ko.observable(false),
    showRate: ko.observable(false),

    toggleInfo: toggleInfo,
    toggleEco: toggleEco,
    toggleRate: toggleRate,
    selectInfo: selectInfo,
    selectEco: selectEco,
    selectRate: selectRate

    //#endregion Properties

    //#endregion control display of map-parts

  };
  return vm;

  function toggleInfo(place) {
      vm.showInfo(!vm.showInfo());
      vm.showEco(false);
      vm.showRate(false);
  }
  function toggleEco(place) {
      vm.showInfo(false);
      vm.showEco(!vm.showEco());
      vm.showRate(false);
  }
  function toggleRate(place) {
      vm.showInfo(false);
      vm.showEco(false);
      vm.showRate(!vm.showRate());
  }
  function selectInfo(place) {
      $root.location.itemClick(place);
      vm.showInfo(true);
      vm.showEco(false);
      vm.showRate(false);
  }
  function selectEco(place) {
      $root.location.itemClick(place);
      vm.showInfo(false);
      vm.showEco(true);
      vm.showRate(false);
  }
  function selectRate(place) {
      $root.location.itemClick(place);
      vm.showInfo(false);
      vm.showEco(false);
      vm.showRate(true);
  }


}); //module