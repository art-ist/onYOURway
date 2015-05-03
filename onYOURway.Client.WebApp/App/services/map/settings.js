define([
    'services/tell'
], function (tell) {

    return {
        defaultRegion: ko.observable(1), // default region '1' === onYOURway / Baden -- can be overriden in shell.js

        mode: ko.observable("bicycle"), //supported: bicycle, foot, car  //TODO: add public, multi
        //Map Styling
        walkIn5: 330,   //meters in 5 minutes at 4 km/h
        bikeIn5: 1800,  //meters in 5 minutes at 21,6 km/h
        clusterLocations: ko.observable(false),
        zoomToSearchResults: ko.observable(true),
        mapPadding: { top: 50, right: 30, bottom: 20, left: 30 }, //px
        autoPan: ko.observable(true),

        showMap: ko.observable('auto'),
        showList: ko.observable('auto'),
        showDetails: ko.observable('auto'),
        showSiteCollector: ko.observable(false),
        showTagSelection: ko.observable(false),
        showVeilOfSilence: true,
        showPointer: true,
        showIndicator: true,

        routeColor: '#0067a3',

        forceMap: false,
        disableDetails: false,
        maxSelectedItems: 5,

        realm: ''
    };

});
