/// <reference path="app.js" />
/// <reference path="logger.js" />
/// <reference path="platform.js" />
define([
  'services/app',
  'services/logger',
  'services/platform',
  'plugins/router'
], function (app, logger, platform, router) {

  // serviceUri is route to the Web API controller
  var locateMetadata = new breeze.MetadataStore(); //see: http://www.breezejs.com/documentation/naming-convention
  var locateContext = new breeze.EntityManager({
    serviceName: config.host + '/api/locate',
    metadataStore: locateMetadata
  });
  // add basic auth header to breeze calls
  //var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
  //ajaxAdapter.defaultSettings = {
  //  beforeSend: function (xhr, settings) {
  //    xhr.setRequestHeader("Authorization", 'Basic ' + authentication.token);
  //  }
  //};

  // JSON proxy for not CORS-enabled cross domain calls
  var proxy = 'JP.aspx?u=';

  var cmk = config.apiKey.cloudmade;
  var lrk = config.apiKey.lyrk;
  var attrib = function(tiles) { return ' Karte: OpenStreetMap — Tiles: ' + tyles + ' — Locations: onYOURway' };

  var location = {
    map: null,

    settings: {
      mode: ko.observable("foot"), //"car", "foot", "bicycle"
      //Map Styling
      tileLayers: [
        //lyrk
        { Name: 'Standard', Layer: new L.TileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=' + lrk, { attribution: attribution, maxZoom: 18 }) },
        { Name: 'Standard (HD)', Layer: new L.TileLayer('http://tiles.lyrk.org/lr/{z}/{x}/{y}?apikey=' + lrk, { attribution: attribution, maxZoom: 18 }) },
        //cloudmade (depricated)
        { Name: 'Standard (depricated)', Layer: new L.TileLayer('http://{s}.tile.cloudmade.com/' + cmk + '/93587'/*styleId*/ + '/256/{z}/{x}/{y}.png', { attribution: attribution, maxZoom: 18, subdomains: 'abc' }) },
        { Name: 'Grau (depricated)', Layer: new L.TileLayer('http://{s}.tile.cloudmade.com/' + cmk + '/22677/256/{z}/{x}/{y}.png', { attribution: attribution, maxZoom: 18, subdomains: 'abc' }) },
        //others
        { Name: 'OpenStreetMap', Layer: new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: attribution, maxZoom: 18, subdomains: 'abc' }) },
        { Name: 'OpenCycleMap', Layer: new L.TileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { attribution: attribution, maxZoom: 18, subdomains: 'abc' }) },
        { Name: 'Wasserfarbe', Layer: new L.TileLayer('http://b.tile.stamen.com/watercolor/{z}/{x}/{y}.png', { attribution: attribution, maxZoom: 18 }) }
        //'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'; subdomains = '1234'; //MapQuest
        //'http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png'; subdomains = '1234'; //MapQuest.Sat (no tiles for detailed zoom)
        //'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'; //OpenCycleMap
        //'http://{s}.tiles.mapbox.com/v3/' + 'examples.map-zr0njcqy' + '/{z}/{x}/{y}.png'; //MapBox
      ],
      walkIn5: 330, //m in 5 minuten bei 4 km/h
      bikeIn5: 1800, //m in 5 minuten bei 21,6 km/h
      clusterLocations: ko.observable(false),
      zoomToSearchResults: ko.observable(true),
      mapPadding: { top: 50, right: 30, bottom: 20, left: 30 }, //px
      autoPan: ko.observable(true),

      showMap: ko.observable('auto'),
      showList: ko.observable('auto'),
      showDetails: ko.observable('auto')
    },

    regions: ko.observableArray(),
    region: ko.observable(),        //selected region
    views: ko.observableArray(),
    locations: ko.observableArray(),
    mapLocations: ko.observableArray(),
    searchSuggestions: ko.observableArray(),
    tags: ko.observableArray(),

    selectedItem: ko.observable(), //current Location

    searchFor: ko.observable(),
    featuredIf: ko.observableArray([
      { Name: ko.observable('Bio'), Selected: new ko.observable(true) },
      { Name: ko.observable('FairTrade'), Selected: new ko.observable(true) },
      { Name: ko.observable('aus der Region'), Selected: new ko.observable(false) },
      { Name: ko.observable('Eigenproduktion'), Selected: new ko.observable(false) }
    ]),
    sortBy: ko.observable(),
    sortOptions: [
      { Name: 'nach Entfernung, offene zuerst', Sorter: sortOpenThenByDistance },
      { Name: 'nach Entfernung, hervorgehobene zuerst', Sorter: sortFeaturedThenByDistance },
      { Name: 'nach Entfernung', Sorter: sortByDistance },
      { Name: 'nach Name', Sorter: sortByName },
    ],

    context: locateContext,
    loactionToEdit: ko.observable(null),
    getLocation: getLocation,
    editLocation: editLocation,

    //position: new ko.observable(),
    route: [],
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
    when: ko.observable(new Date()),

    //--Layergroups:
    layers: {
      tileLayer: null,
      routeLayer: null,
      fiveMinutesInidcatorLayer: null,
      transportLayer: null,
      bikeLayer: null,
      locationLayer: null,
      pointerLayer: null
    },

    //methods
    initializeMap: initializeMap,

    setTileLayer: setTileLayer,
    setMode: setMode,

    search: search,
    showByTagName: showByTagName,
    locate: locate,

    getCurrentPosition: getCurrentPosition,
    itemClick: itemClick,
    drawMarkers: drawMarkers,

    setView: setView,
    drawPointer: _drawPointer,
    panIntoView: _panMap,

    toggleMap: toggleMap,
    toggleList: toggleList,
    toggleDetails: toggleDetails

  }; //var location

  //#region Constructor 

  location.sortBy.subscribe(function (newValue) {
    location.mapLocations(location.mapLocations().sort(newValue.Sorter));
  });

  //#endregion Constructor 
  return location;

  //#region Private Members

  //#region utility functions

  function wktToCoords(wkt) {
    var result = null;
    var matches = wkt.match(/[0-9][0-9., ]*/g);         //get text between ()
    if (matches.length > 1) { // MultiLine, MultiPolygon, ...
      result = [];
    }
    for (var i = 0; i < matches.length; i++) {    //if more than one loop
      var pointStrings = matches[i].replace(/\,\ /g, ',').split(',');
      var points = [];
      for (var j = 0; j < pointStrings.length; j++) {
        points.push(pointStrings[j].split(' '));
      }
      if (matches.length > 1) {
        result.push(points);
      } else {
        result = points;
      }
    }
    return result;
  } //wktToCoords

  function coordsToWkt(coords, type) {
    var result = '';
    switch (type) {
      case 'POINT':
        result = 'POINT (' + coords[0] + ' ' + coords[1] + ')';
        break;
      case 'LINESTRING':
        result = 'LINESTRING (';
        for (var i = 0; i < coords.length; i++) {
          result += (i > 0 ? ', ' : '') + coords[i][0] + ' ' + coords[i][1];
        }
        result += ')';
        break;
        //case 'Polygon':
        //...http://en.wikipedia.org/wiki/Well-known_text
    }
    return result;
  } //coordsToWkt

  function latLngToWkt(latLngs, type, project) {
    var result = '';
    var point;
    switch (type) {
      case 'POINT':
        if (project) {
          point = transformLatLongToXyMeter(latLngs); //project
          result = 'POINT (' + point.x + ' ' + point.y + ')';
        } else if (latLngs instanceof L.LatLng) {
          result = 'POINT (' + latLngs.lng + ' ' + latLngs.lat + ')';
        } else {
          result = 'POINT (' + latLngs[1] + ' ' + latLngs[0] + ')';
        }
        break;
      case 'LINESTRING':
        result = 'LINESTRING (';
        for (var i = 0; i < latLngs.length; i++) {
          var ll = latLngs[i] instanceof L.LatLng
                 ? latLngs[i]
                 : L.latLng(latLngs[i][1], latLngs[i][0]);
          if (project) { //project
            point = transformLatLongToXyMeter(ll); //project
            result += (i > 0 ? ', ' : '') + point[0] + ' ' + point[1];
          } else {
            result += (i > 0 ? ', ' : '') + ll.lng + ' ' + ll.lat;
          }
        }
        result += ')';
        break;
        //case 'Polygon':
        //...http://en.wikipedia.org/wiki/Well-known_text
    }
    return result;
  } //latLngToWkt

  function transformLatLongToXyMeter(latLng) {
    var R = 6367500; //Earth Radius in meter
    var PI = Math.PI;
    var a = latLng.lat;
    var p = latLng.lng;

    var x = R * Math.cos(a * PI / 180) * p * PI / 180;
    var y = R * a * PI / 180;
    return [x, y]; // return point as array 
  } //transformLatLongToXyMeter

  function transformXyMeterToLatLong(point) {
    var R = 6367500; //Earth Radius in meter
    var PI = Math.PI;
    var x = point[0];
    var y = point[1];

    var lng = y * 180 / (R * PI);
    var lat = x * 180 / (R * PI * Math.cos(y / R));
    return new L.LatLng(lat, lng);
  } //transformXyMeterToLatLong

  //function pointsToWkt(points, type) {
  //  var result = '';
  //  switch (type) {
  //    case 'POINT':
  //      result = 'POINT (' + points.x + ' ' + points.y + ')';
  //      break;
  //    case 'LINESTRING':
  //      result = 'LINESTRING (';
  //      for (var i = 0; i < points.length; i++) {
  //        result += (i > 0 ? ', ' : '') + points[i].x + ' ' + points[i].y;
  //      }
  //      result += ')';
  //      break;
  //      //case 'Polygon':
  //      //...http://en.wikipedia.org/wiki/Well-known_text
  //  }
  //  return result;
  //}

  //#endregion utility functions

  function _getLocationIcon(loc, selected) {
    return L.AwesomeMarkers.icon({
      icon: loc.Icon ? loc.Icon() : null,
      prefix: 'fa',
      markerColor: selected ? "cadetblue"
                            : loc.isFeatured() ? "green"
                            : "orange"
    });
  } //_getLocationIcon

  function _drawVeilOfSilence(map, regions) {
    var bounds = [
      L.GeoJSON.coordsToLatLngs([[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]])
    ];
    ///*Baden*/ bounds.push([16.290953, 47.963978], [16.292168, 47.964832], [16.292507, 47.96506], [16.294008, 47.966106], [16.294886, 47.966766], [16.29548, 47.967186], [16.295818, 47.967323], [16.296103, 47.967377], [16.296444, 47.96785], [16.296726, 47.968456], [16.297009, 47.9688], [16.297518, 47.96937], [16.298113, 47.970074], [16.298765, 47.97085], [16.299587, 47.97184], [16.300068, 47.97254], [16.30008, 47.972565], [16.30137, 47.974174], [16.302248, 47.97539], [16.302929, 47.97701], [16.301882, 47.97674], [16.299845, 47.97703], [16.298855, 47.976307], [16.297834, 47.97547], [16.297012, 47.97473], [16.29625, 47.97494], [16.294865, 47.975212], [16.293932, 47.975403], [16.292942, 47.97565], [16.291613, 47.97607], [16.29082, 47.97645], [16.289915, 47.976795], [16.28935, 47.976986], [16.288643, 47.977367], [16.288332, 47.97756], [16.287624, 47.9779], [16.28672, 47.978302], [16.285872, 47.97872], [16.285505, 47.978912], [16.28508, 47.97916], [16.28279, 47.98002], [16.280216, 47.98103], [16.276907, 47.98227], [16.274164, 47.98328], [16.273485, 47.983566], [16.272665, 47.98372], [16.271845, 47.983852], [16.27159, 47.984062], [16.271168, 47.984253], [16.27094, 47.984425], [16.270687, 47.984596], [16.270489, 47.984673], [16.270092, 47.984806], [16.268423, 47.98504], [16.267801, 47.98511], [16.267517, 47.985153], [16.266699, 47.985535], [16.265936, 47.98582], [16.265453, 47.985992], [16.265087, 47.986164], [16.264435, 47.98649], [16.264353, 47.986584], [16.264153, 47.986794], [16.263533, 47.987324], [16.263248, 47.987534], [16.262598, 47.987556], [16.261608, 47.98746], [16.261297, 47.98769], [16.260702, 47.9882], [16.260448, 47.988377], [16.259884, 47.988792], [16.25929, 47.989098], [16.258837, 47.98969], [16.25862, 47.989777], [16.258186, 47.99045], [16.25782, 47.990887], [16.257677, 47.990944], [16.257452, 47.99104], [16.257338, 47.991077], [16.257227, 47.991096], [16.257057, 47.99121], [16.256208, 47.9927], [16.25604, 47.99298], [16.255983, 47.99319], [16.255983, 47.993954], [16.256012, 47.994274], [16.25604, 47.99454], [16.256126, 47.99479], [16.256184, 47.994957], [16.256268, 47.995243], [16.25641, 47.99593], [16.256693, 47.996822], [16.256863, 47.99758], [16.256891, 47.997677], [16.257006, 47.998173], [16.257233, 47.998817], [16.25892, 47.99943], [16.259611, 48.000134], [16.259726, 48.0003], [16.259924, 48.0003], [16.2603, 48.00027], [16.260689, 48.000282], [16.260717, 48.00072], [16.260744, 48.00091], [16.261057, 48.00091], [16.261566, 48.000946], [16.261963, 48.000984], [16.262417, 48.000965], [16.262897, 48.00108], [16.263351, 48.0011], [16.263409, 48.001816], [16.263323, 48.002728], [16.263268, 48.00288], [16.263124, 48.002995], [16.262953, 48.00309], [16.262783, 48.003147], [16.262217, 48.00326], [16.262018, 48.0033], [16.261791, 48.003338], [16.261509, 48.003376], [16.260773, 48.00347], [16.26063, 48.00387], [16.260572, 48.00427], [16.260572, 48.004574], [16.260515, 48.00516], [16.260427, 48.00582], [16.260033, 48.005825], [16.260033, 48.0059], [16.259949, 48.006565], [16.259892, 48.00696], [16.259832, 48.007458], [16.259832, 48.007477], [16.259748, 48.007988], [16.259748, 48.008274], [16.259607, 48.008537], [16.260202, 48.00848], [16.260202, 48.008728], [16.26023, 48.009678], [16.260145, 48.01019], [16.260048, 48.011063], [16.259659, 48.01223], [16.259089, 48.013634], [16.25889, 48.013973], [16.25847, 48.01404], [16.25728, 48.014404], [16.256714, 48.014633], [16.256516, 48.01473], [16.256142, 48.015163], [16.255577, 48.01524], [16.255266, 48.015392], [16.255182, 48.01545], [16.254616, 48.015755], [16.254248, 48.01602], [16.253878, 48.01629], [16.25365, 48.016438], [16.252886, 48.016838], [16.252092, 48.017124], [16.25161, 48.01724], [16.2511, 48.017372], [16.250616, 48.017467], [16.250107, 48.017506], [16.249681, 48.017544], [16.249285, 48.0176], [16.248747, 48.017754], [16.248434, 48.01785], [16.24801, 48.01806], [16.24784, 48.017906], [16.247726, 48.017715], [16.247272, 48.017014], [16.247217, 48.016937], [16.247019, 48.01658], [16.246904, 48.016502], [16.246735, 48.01658], [16.245998, 48.017056], [16.24563, 48.017223], [16.245731, 48.01748], [16.245203, 48.017662], [16.245005, 48.01787], [16.244778, 48.018005], [16.244326, 48.018005], [16.243788, 48.017986], [16.243334, 48.01789], [16.242397, 48.017628], [16.242058, 48.01759], [16.242086, 48.01734], [16.242058, 48.017246], [16.241945, 48.01723], [16.241833, 48.01723], [16.24169, 48.017303], [16.241463, 48.017494], [16.241123, 48.017326], [16.24084, 48.017212], [16.240328, 48.017174], [16.239649, 48.01716], [16.239592, 48.017197], [16.239563, 48.017612], [16.239477, 48.01788], [16.239138, 48.0179], [16.238743, 48.017975], [16.238344, 48.01805], [16.23788, 48.01823], [16.235254, 48.0187], [16.234943, 48.018833], [16.234262, 48.019077], [16.234009, 48.019154], [16.23242, 48.019726], [16.231342, 48.02009], [16.229755, 48.0207], [16.22743, 48.021458], [16.226692, 48.021572], [16.225616, 48.021744], [16.224768, 48.02167], [16.224087, 48.02171], [16.223747, 48.021767], [16.222754, 48.021862], [16.222101, 48.021957], [16.220034, 48.022057], [16.218332, 48.022057], [16.216234, 48.022152], [16.215944, 48.022076], [16.215101, 48.02204], [16.21428, 48.02197], [16.213741, 48.02193], [16.213259, 48.02195], [16.212833, 48.02197], [16.212494, 48.021683], [16.21221, 48.021305], [16.21187, 48.02096], [16.211672, 48.02085], [16.211388, 48.020794], [16.210766, 48.020737], [16.209972, 48.02078], [16.209717, 48.020817], [16.209406, 48.02087], [16.207335, 48.02127], [16.207165, 48.021156], [16.206995, 48.021008], [16.206003, 48.021255], [16.205523, 48.02137], [16.205153, 48.021465], [16.204672, 48.02158], [16.204247, 48.02175], [16.203423, 48.022186], [16.203396, 48.02234], [16.203367, 48.022568], [16.203028, 48.022587], [16.202856, 48.022587], [16.202347, 48.022453], [16.201553, 48.022038], [16.201412, 48.02198], [16.201355, 48.02196], [16.201185, 48.02189], [16.201015, 48.02189], [16.200903, 48.021908], [16.200674, 48.02198], [16.200562, 48.022076], [16.200504, 48.022133], [16.200222, 48.02238], [16.199766, 48.02295], [16.19954, 48.02312], [16.199116, 48.02331], [16.19869, 48.023445], [16.198208, 48.023502], [16.197302, 48.02358], [16.196707, 48.02354], [16.196253, 48.02343], [16.19577, 48.023277], [16.195118, 48.02307], [16.194893, 48.023052], [16.194609, 48.02307], [16.19441, 48.023148], [16.194183, 48.02326], [16.193787, 48.02364], [16.19356, 48.023926], [16.193304, 48.024193], [16.193077, 48.024437], [16.192568, 48.02423], [16.191973, 48.02383], [16.19166, 48.023663], [16.191462, 48.023567], [16.191122, 48.0233], [16.190613, 48.023018], [16.19013, 48.02268], [16.189903, 48.02241], [16.18982, 48.022316], [16.189724, 48.022224], [16.18965, 48.02194], [16.189537, 48.021652], [16.189566, 48.02116], [16.189592, 48.021103], [16.189678, 48.020893], [16.189848, 48.02072], [16.190115, 48.020657], [16.19026, 48.020634], [16.190569, 48.020584], [16.19073, 48.020428], [16.190893, 48.020176], [16.191065, 48.019913], [16.191114, 48.01961], [16.191162, 48.019394], [16.190983, 48.01884], [16.190767, 48.018517], [16.190596, 48.018368], [16.19046, 48.01823], [16.190401, 48.018154], [16.190357, 48.017986], [16.190256, 48.017807], [16.190077, 48.01763], [16.189821, 48.017403], [16.189737, 48.017326], [16.189568, 48.017174], [16.189226, 48.017365], [16.187979, 48.018032], [16.187412, 48.018276], [16.18642, 48.018562], [16.186392, 48.018562], [16.186308, 48.0186], [16.186165, 48.018623], [16.186052, 48.01858], [16.185541, 48.018166], [16.18489, 48.017673], [16.184523, 48.017372], [16.184011, 48.017143], [16.183586, 48.01705], [16.183218, 48.01705], [16.182993, 48.017105], [16.182652, 48.017296], [16.18231, 48.01743], [16.181402, 48.017696], [16.180668, 48.017868], [16.180323, 48.0179], [16.180157, 48.017906], [16.179619, 48.017925], [16.179165, 48.01787], [16.178656, 48.017757], [16.17806, 48.017513], [16.177862, 48.01738], [16.17772, 48.01719], [16.177578, 48.01681], [16.177492, 48.01662], [16.177353, 48.016487], [16.17704, 48.016205], [16.176672, 48.01607], [16.176304, 48.016033], [16.176105, 48.015976], [16.17585, 48.01588], [16.175623, 48.015713], [16.175367, 48.015408], [16.175056, 48.015163], [16.174717, 48.014954], [16.172932, 48.01418], [16.17262, 48.014046], [16.172592, 48.013363], [16.172564, 48.012074], [16.172647, 48.01156], [16.172905, 48.010933], [16.17299, 48.010536], [16.173054, 48.00989], [16.173187, 48.009663], [16.173471, 48.009415], [16.173592, 48.008354], [16.173899, 48.007896], [16.174126, 48.00744], [16.174152, 48.006947], [16.174494, 48.006493], [16.174812, 48.00583], [16.174948, 48.00581], [16.174976, 48.005787], [16.175323, 48.005657], [16.175713, 48.005505], [16.176422, 48.004875], [16.176931, 48.004383], [16.177416, 48.004], [16.178526, 48.00332], [16.178555, 48.00317], [16.17852, 48.00311], [16.179314, 48.00271], [16.179768, 48.002483], [16.180391, 48.00214], [16.181185, 48.001663], [16.181667, 48.001453], [16.182348, 48.001133], [16.183027, 48.000904], [16.183426, 48.00079], [16.18385, 48.000637], [16.18419, 48.000446], [16.184387, 48.000256], [16.184898, 47.999706], [16.185127, 47.999783], [16.18558, 48.000046], [16.186203, 48.0002], [16.18711, 48.000214], [16.187902, 48.000195], [16.188385, 48.00012], [16.189121, 47.999947], [16.190256, 47.99955], [16.192007, 47.99949], [16.192383, 47.999508], [16.192522, 47.999508], [16.192438, 47.9997], [16.192211, 47.999924], [16.192156, 48.00002], [16.192183, 48.000057], [16.192383, 48.00017], [16.19258, 48.00023], [16.192835, 48.000248], [16.193373, 48.000263], [16.194338, 48.00015], [16.195103, 48.000053], [16.195244, 48.00032], [16.195414, 48.00062], [16.197115, 48.00036], [16.198618, 48.000164], [16.199142, 48.000187], [16.198862, 48.000004], [16.19939, 47.99947], [16.198223, 47.998684], [16.197826, 47.99844], [16.197458, 47.998344], [16.197119, 47.998344], [16.196241, 47.998573], [16.195251, 47.99888], [16.194914, 47.99905], [16.194658, 47.99882], [16.194572, 47.99869], [16.194319, 47.998234], [16.193865, 47.99789], [16.193329, 47.99738], [16.192818, 47.996883], [16.192337, 47.99692], [16.191828, 47.99687], [16.191149, 47.996773], [16.19013, 47.99679], [16.188745, 47.99672], [16.188433, 47.996548], [16.18849, 47.996357], [16.188885, 47.995808], [16.189734, 47.994892], [16.190468, 47.99451], [16.190836, 47.994377], [16.191147, 47.994358], [16.192335, 47.99428], [16.193325, 47.994106], [16.193438, 47.994053], [16.193466, 47.994034], [16.193495, 47.994034], [16.194033, 47.99382], [16.194315, 47.993687], [16.194653, 47.993553], [16.194992, 47.993404], [16.19734, 47.99279], [16.198133, 47.99256], [16.1985, 47.992485], [16.198896, 47.992428], [16.198925, 47.992218], [16.19898, 47.99199], [16.200111, 47.991837], [16.200453, 47.9918], [16.200716, 47.99173], [16.20082, 47.991703], [16.20113, 47.991474], [16.2013, 47.99117], [16.201637, 47.990543], [16.201921, 47.99018], [16.202374, 47.989647], [16.202627, 47.989193], [16.202656, 47.98902], [16.202682, 47.98866], [16.202711, 47.988335], [16.202599, 47.988144], [16.203388, 47.988102], [16.204107, 47.988136], [16.205502, 47.987988], [16.207571, 47.98767], [16.20769, 47.98865], [16.2082, 47.988632], [16.20854, 47.988594], [16.210238, 47.98857], [16.211199, 47.98863], [16.211227, 47.989998], [16.213095, 47.98986], [16.215075, 47.989708], [16.215668, 47.989403], [16.215923, 47.98929], [16.217367, 47.989265], [16.219488, 47.98917], [16.220295, 47.98925], [16.221298, 47.989033], [16.224155, 47.988785], [16.223843, 47.98808], [16.224026, 47.98805], [16.224295, 47.98802], [16.225597, 47.98783], [16.225996, 47.988403], [16.226305, 47.9884], [16.227125, 47.9884], [16.227463, 47.98817], [16.227917, 47.987865], [16.22834, 47.986935], [16.228706, 47.98663], [16.229416, 47.98619], [16.22981, 47.98577], [16.230495, 47.985386], [16.230566, 47.98518], [16.230568, 47.984833], [16.230406, 47.984615], [16.230206, 47.984234], [16.230036, 47.98387], [16.22995, 47.98366], [16.229637, 47.982994], [16.229015, 47.981667], [16.228533, 47.98062], [16.228193, 47.980034], [16.228163, 47.979748], [16.228022, 47.97946], [16.229353, 47.979042], [16.229805, 47.979477], [16.232464, 47.979076], [16.232727, 47.978973], [16.232971, 47.978886], [16.233877, 47.97875], [16.234386, 47.9786], [16.235092, 47.978195], [16.235771, 47.977894], [16.236677, 47.97736], [16.238344, 47.976654], [16.239334, 47.976368], [16.240637, 47.976], [16.242079, 47.97562], [16.24256, 47.97564], [16.24304, 47.975677], [16.243322, 47.975697], [16.24454, 47.97566], [16.244963, 47.975693], [16.246208, 47.975807], [16.247143, 47.975883], [16.24738, 47.97612], [16.247482, 47.976223], [16.247599, 47.976353], [16.247822, 47.976604], [16.248104, 47.976624], [16.248346, 47.976643], [16.248783, 47.97664], [16.248783, 47.97626], [16.249405, 47.97576], [16.249603, 47.975174], [16.249716, 47.97483], [16.249857, 47.97449], [16.250732, 47.973347], [16.251835, 47.971977], [16.25223, 47.97148], [16.252485, 47.971252], [16.252825, 47.970856], [16.253193, 47.970436], [16.254093, 47.96984], [16.254265, 47.96929], [16.25469, 47.968704], [16.255056, 47.96838], [16.255508, 47.967922], [16.255762, 47.967693], [16.256132, 47.96752], [16.256866, 47.96779], [16.257404, 47.968014], [16.257998, 47.968185], [16.25831, 47.968224], [16.259073, 47.96853], [16.25981, 47.96913], [16.259876, 47.96949], [16.25981, 47.96978], [16.25998, 47.96999], [16.25998, 47.97029], [16.259869, 47.970577], [16.259869, 47.970978], [16.259811, 47.971188], [16.259953, 47.97134], [16.260633, 47.971775], [16.261028, 47.97191], [16.261482, 47.97206], [16.261707, 47.97223], [16.262161, 47.97261], [16.261738, 47.972992], [16.262445, 47.97356], [16.263462, 47.974644], [16.26417, 47.97428], [16.26451, 47.97409], [16.265923, 47.973537], [16.266348, 47.973385], [16.266714, 47.973175], [16.267082, 47.973003], [16.268072, 47.9727], [16.269007, 47.97247], [16.26977, 47.97224], [16.271324, 47.971855], [16.272118, 47.971645], [16.273872, 47.970863], [16.27636, 47.969795], [16.276417, 47.969757], [16.276728, 47.969566], [16.277433, 47.969624], [16.277971, 47.96966], [16.27899, 47.96932], [16.279753, 47.969147], [16.280659, 47.96888], [16.281027, 47.968784], [16.282213, 47.96855], [16.282751, 47.968475], [16.283232, 47.968475], [16.283686, 47.9684], [16.284054, 47.968285], [16.284334, 47.96819], [16.284702, 47.968056], [16.284958, 47.967922], [16.285324, 47.967636], [16.28558, 47.967445], [16.285948, 47.96716], [16.287416, 47.96621], [16.287727, 47.966057], [16.288294, 47.96575], [16.289057, 47.965313], [16.28951, 47.965046], [16.290697, 47.964188], [16.290953, 47.963978]);
    for (var i = 0; i < regions.length; i++) {
      var wkt = regions[i].Boundary().Geography.WellKnownText;
      var coords = wktToCoords(wkt);
      var latLngs = L.GeoJSON.coordsToLatLngs(coords);
      bounds.push(latLngs);
    }
    var mPoly = L.polygon(bounds, {
      color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#000000", fillOpacity: 0.15, clickable: false
    });
    //var mPoly = L.polygon(bounds, { color: "#000000", weight: 4, opacity:0.4, smoothFactor: 2.0, fillColor: "#000000", fillOpacity: 0.15 });
    mPoly.addTo(map);
  } //_drawVeilOfSilence

  //function _itemMouseOver() { }
  //function _itemMouseOut() { }

  function _drawPointer(mode) { //draws a pointer to connect the listitem of the selected venture with its marker
    var offset = 8;
    var height = 15;
    var map = location.map;

    if (location.layers.pointerLayer) { //remove a previously drawn pointer
      map.removeLayer(location.layers.pointerLayer);
    }
    if (mode && mode === 'hide') return; //just hide -> done
    if (!location.selectedItem() || !location.selectedItem().marker)  return; //no item selected or no marker -> done
    if (!location.settings.showList()) return; //list not visible -> done

    var listItem = $('#' + location.selectedItem().Id());
    if (listItem.length === 0) return; //dom element for selectesd item not found -> run away and hide

    var pointerOptions = {
      className: 'oyw-map-pointer',
      weight: null,
      color: null,
      opacity: null,
      fillColor: null,
      fillOpacity: null,
      zIndexOffset: 1000
    };
    var list = $('#locationList');
    var top = listItem.position().top + offset;
    var left = list.position().left + listItem.position().left;
    var pointer = new L.polygon([
      map.containerPointToLatLng([left, top]),
      map.containerPointToLatLng([left, top + height]),
      location.selectedItem().marker.getLatLng(),
    ], pointerOptions);
    location.layers.pointerLayer = pointer;
    map.addLayer(pointer);
  } //_drawPointer

  function _setMarker(group, marker, loc) {
    if (!loc.coords) return;

    var add = !marker ? true : false;
    if (add) {
      marker = new L.Marker({ prefix: "fa" });
    }
    //var coords = loc.Position.Geography.WellKnownText.replace(/POINT \(/, '').replace(/\)/, '').split(' ');
    var latLong = [loc.coords[1], loc.coords[0]];
    marker.options.title = loc.Name();
    marker.setLatLng(latLong);
    marker.setIcon(_getLocationIcon(loc));
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
  } //_setMarker

  function _loadRegions(map) {
    var query = breeze.EntityQuery.from("Regions");
    return locateContext
      .executeQuery(query)
      .then(function (d) {
        var regions = d.results;
        logger.log(regions.length + " Regions found", 'location');
        location.regions(regions);
        //TODO: Get from settings/current location
        location.region(regions[0]);
        if (regions.length) {
          location.views(regions[0].Views());
          //ToDo: in Select Region auslagern?
          setView(0);
        }
        _drawVeilOfSilence(map, regions);
      })
      .fail(function (error) {
        logger.error("Query for Regions failed: " + error.message, 'location', error);
      });
  } //_loadRegions

  function _loadPlaces() {
    var query = breeze.EntityQuery.from("Places");
    query.parameters = {
      RegionId: location.Region ? location.Region().Id() : 1,
      Lang: 'de'//app.lang
    };

    return locateContext
      .executeQuery(query)
      .then(function (d) {
        if (d.results) {
          var places = ko.mapping.fromJS(d.results[0].Places.Place)();
          //logger.log('places found', 'location - _loadPlaces', places);

          //extend places
          //$.each(places, function (i, item) {
          places.forEach(function (item) {
            if (item.Position && item.Position().startsWith("POINT")) item.coords = item.Position().replace(/POINT \(/, '').replace(/\)/, '').split(' ');

            //** opening_hours **
            if (item.oh === undefined && item.OpeningHours && item.OpeningHours()) {
              try {
                item.oh = new opening_hours(item.OpeningHours(), {
                  "place_id": "97604310",
                  "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
                  "osm_type": "relation",
                  "osm_id": "77189",
                  "lat": "48.2817813",
                  "lon": "15.7632457",
                  "display_name": "Niederösterreich, Österreich",
                  "address": {
                    "state": "Niederösterreich",
                    "country": "Österreich",
                    "country_code": "at"
                  }
                });
              } catch (e) {
                logger.log('OpeningHours Error: ' + e, 'locate', item);
              }
            }

            //** isOpen **
            if (item.isOpen === undefined) {
              item.isOpen = function () {

                if (!item.oh) return null;
                var when = !location.when() || location.when() === 'jetzt' ? new Date() : location.when();
                return item.oh.getState(when);

              }; // isOpen()
            } //if (item.isOpen === undefined)

            //** OpeningHours **
            if (item.OpenDisplay === undefined) {
              item.OpenDisplay = ko.computed(function () {
                if (!item.oh) return null;
                return item.oh.prettifyValue({
                  block_sep_string: '<br/>', print_semicolon: false
                }).replace('Su', 'So').replace('Tu', 'Di').replace('Th', 'Do').replace('PH', 'Feiertag');
              }); // OpenDisplay
            } //if (item.OpenDisplay === undefined)

            //** distance **
            if (item.distance === undefined) {
              if (!item.coords) return 100000000;

              item.distance = function () {
                ///----------
                var reader = new jsts.io.WKTReader();
                var wkt;
                if (location.route && location.route.length > 0) {
                  wkt = latLngToWkt(location.route, 'LINESTRING', false);
                }
                else if (location.start.coords())
                  wkt = latLngToWkt(new L.LatLng(location.start.coords()[1], location.start.coords()[0]), 'POINT', false);
                else {
                  return -1;
                }
                var to = reader.read(wkt); //including transform
                wkt = latLngToWkt(new L.LatLng(item.coords[1], item.coords[0]), 'POINT', false);
                var locPos = reader.read(wkt); //including transform
                var dist = locPos.distance(to);
                //console.log(item.Name() + ' - ' + dist * 1000);
                return dist;
              };
            }

            //** isFeatured **
            if (item.isFeatured === undefined) {
              item.isFeatured = function () {
                if (!item.Tag) return false;
                var _tags = ko.isObservable(item.Tag)
                          ? item.Tag()
                          : [item.Tag]
                ;
                for (var i = 0; i < _tags.length; i++) {
                  for (var f = 0; f < location.featuredIf().length; f++) {
                    if (_tags[i].Name().toLowerCase() === location.featuredIf()[f].Name().toLowerCase() && location.featuredIf()[f].Selected() === true) {
                      return true;
                    }
                  }
                }
                return false;
              }; // isFeatured()
            } // if (item.isFeatured === undefined)

          }); //places.forEach
        } //if (d.results)

        //update locations
        location.locations(places);

        logger.log(places.length + ' places loaded', 'location');
      })
      .fail(function (error) {
        var msg = breeze.saveErrorMessageService.getErrorMessage(error);
        error.message = msg;
        logger.error("Die Angebote der Region konnten nicht geladen werden. Sie können versuchen Sie die Seite neu aufzurufen.", 'location - _loadPlaces', error);
        throw error;
      });

  } //_loadPlaces

  function _loadSearchSuggestions() {
    var query = breeze.EntityQuery.from("SearchSuggestions");
    query.parameters = {
      RegionId: location.Region ? location.Region().Id() : 1,
      Lang: 'de'//app.lang
    };

    return locateContext
      .executeQuery(query)
      .then(function (d) {
        $.each(d.results, function (i, item) {
          location.searchSuggestions.push(item.Name);
          if (item.Class === 'tag') {
            location.tags.push(item.Name);
          } //if
        }); //$.each
        //logger.log(location.searchSuggestions().length + " SearchSuggestions loaded", 'location', location.searchSuggestions());
      })
      .fail(function (error) {
        var msg = breeze.saveErrorMessageService.getErrorMessage(error);
        error.message = msg;
        logger.logError("Suchvorschläge konnten nicht geladen werden.", 'location - _loadSearchSuggestions', error);
        throw error;
      });

  } //_loadSearchSuggestions

  function _setFiveMinutesInidcator(aroundWhat) {
    logger.log('starting', 'location - _setFiveMinutesIndicator', aroundWhat);
    var map = location.map;
    var indicator = null;
    var indicatorOptions = {
      title: '5 Minuten zufuß',
      //color: 'transparent',
      stroke: false,
      fillColor: '#b8f71a', //ToDo: Move color to theme
      fillOpacity: 0.2
    };
    if (location.layers.fiveMinutesInidcatorLayer) {
      map.removeLayer(location.layers.fiveMinutesInidcatorLayer);
    }
    //if (aroundWhat[0] instanceof L.LatLng) { //aroundWhat is an array and it's first Element is a L.LatLng -> route
    if (aroundWhat[0] instanceof Array) { //aroundWhat is an array and it's first Element is also -> route

      //buffer errechnen
      var reader = new jsts.io.WKTReader();
      var writer = new jsts.io.WKTWriter();

      var wkt = latLngToWkt(aroundWhat, 'LINESTRING', true); //coordsToWkt
      logger.log('wkt after latLngToWkt(.,.) = ', 'location - _setFiveMinutesIndicator', wkt);
      var input = reader.read(wkt); //including transform
      logger.log('calculating Buffer for ' + JSON.stringify(input), 'location - _setFiveMinutesIndicator');
      var buffer = input.buffer(location.settings.walkIn5);
      logger.log('jsts buffer = ', 'location - _setFiveMinutesIndicator', buffer);

      wkt = writer.write(buffer);
      logger.log('calculated buffer', 'location - _setFiveMinutesIndicator', wkt);
      var points = wktToCoords(wkt); //convert 2 point array
      logger.log('points after wktToCoords(wkt) = ', 'location - _setFiveMinutesIndicator', points);
      var latLngs = [];
      for (var i = 0; i < points.length; i++) {  //transform to spherical
        latLngs.push(transformXyMeterToLatLong(points[i]));
      }
      logger.log('latLngs nach punktweiser transformXyMeterToLatLong(.) transformation = ', 'location - _setFiveMinutesIndicator', latLngs);

      //logger.log('setting Polygon for ' + JSON.stringify(aroundWhat[0]) + ' starting at  ' + JSON.stringify(latLngs[0]), 'location - _setFiveMinutesIndicator');
      indicator = L.polygon(latLngs, indicatorOptions);
      location.layers.fiveMinutesIndicatorLayer = indicator;
      map.addLayer(indicator);
    }
    if (typeOf(aroundWhat[0]) === 'number' && aroundWhat.length > 1) { //ok, but it's a coordinate Pair -> position?
      var latLng = [aroundWhat[1], aroundWhat[0]];
      indicator = L.circle(latLng, location.settings.walkIn5, indicatorOptions);
      location.layers.fiveMinutesInidcatorLayer = indicator;
      map.addLayer(indicator);
    }

    location.mapLocations(location.mapLocations().sort(location.sortBy().Sorter));
  } //_setFiveMinutesInidcator

  //Route zwischen zwei Punkten berechnen
  function _getRoute() {
    var startC = location.start.coords();
    var endC = location.end.coords();
    var lang = 'de';

    var url = proxy + 'http://routes.cloudmade.com/' + cmk
            + config.host + '/api/0.3/' + startC[1] + ',' + startC[0] + ',' + endC[1] + ',' + endC[0] + '/' + location.settings.mode() + '.js?lang=de&units=km';
    return $.getJSON(url)
      .pipe(function (route) {
        if (route.status === 0) {
          location.route = route.route_geometry;
        }
        else {
          logger.error('Die Route konnte nicht ermittelt werden: ' + route.status_message(), 'location - geoCode - cloudmade');
        }
      })
      .fail(function (err) {
        logger.error('Die Route konnte nicht berechnet werden: ' + err.error, 'location - geoCode'); //ToDo: Message
        //route = { "version": 0.3, "status": 0, "route_summary": { "total_distance": 2133, "total_time": 513, "start_point": "Grabengasse", "end_point": "Lokalbahnzeile" }, "route_geometry": [[48.00816, 16.235531], [48.007969, 16.235661], [48.007141, 16.23617], [48.007359, 16.23703], [48.007511, 16.237801], [48.00708, 16.237961], [48.006611, 16.238689], [48.005459, 16.239941], [48.005589, 16.24048], [48.005669, 16.24119], [48.005699, 16.24177], [48.005669, 16.242371], [48.005589, 16.242979], [48.00552, 16.24374], [48.005379, 16.243879], [48.005169, 16.244289], [48.005058, 16.244459], [48.00494, 16.244459], [48.004082, 16.245729], [48.00388, 16.24604], [48.00367, 16.24633], [48.003399, 16.24671], [48.003189, 16.247101], [48.002979, 16.247351], [48.002289, 16.247589], [48.00227, 16.24802], [48.002399, 16.249491], [48.002541, 16.25045], [48.002579, 16.2507], [48.002529, 16.250731], [48.002491, 16.250811], [48.002491, 16.25091], [48.002529, 16.250971], [48.002468, 16.25111], [48.002411, 16.25135], [48.002331, 16.25185], [48.00227, 16.252399], [48.002251, 16.25284], [48.002319, 16.25308], [48.002548, 16.253771], [48.00267, 16.254419], [48.00272, 16.2563], [48.00275, 16.25639], [48.002769, 16.257259], [48.002869, 16.257259], [48.00293, 16.257271], [48.003559, 16.25761]], "route_instructions": [["Richtung Südost auf Grabengasse", 122, 0, 29, "0.1 km", "SE", 155.2], ["Bei Am Fischertor links abbiegen", 128, 2, 31, "0.1 km", "E", 69.7, "TL", 272.3], ["Bei Annagasse rechts abbiegen", 359, 4, 86, "0.4 km", "S", 165.6, "TR", 92.0], ["Bei Christalniggasse links abbiegen", 422, 7, 101, "0.4 km", "E", 71.0, "TL", 287.0], ["Weiter", 18, 15, 4, "18 m", "SE", 132.2, "C", 3.9], ["Bei B212\/Dammgasse rechts abbiegen", 13, 16, 2, "13 m", "S", 182.6, "TR", 50.4], ["Links halten bei Prinz-Solms-Straße", 199, 17, 48, "0.2 km", "SE", 135.2, "TSLL", 312.7], ["Weiter auf Prinz-Solms-Straße", 32, 19, 8, "32 m", "SE", 137.0, "C", 2.9], ["Weiter auf Prinz-Solms-Straße", 224, 20, 54, "0.2 km", "SE", 136.5, "C", 359.5], ["Bei Leesdorfer Hauptstraße links abbiegen", 344, 24, 83, "0.3 km", "E", 92.3, "TL", 285.6], ["Bei Leesdorfer Hauptstraße rechts abbiegen", 41, 28, 10, "41 m", "S", 160.3, "TR", 63.6], ["Im Kreisverkehr zweite Ausfahrt (Kanalgasse) nehmen", 616, 32, 148, "0.6 km", "SE", 122.2, "EXIT2", 0.0], ["Bei Lokalbahnzeile links abbiegen", 99, 43, 24, "99 m", "N", 0.7, "TL", 271.8]] }
        location.route = [[48.00816, 16.235531], [48.007969, 16.235661], [48.007141, 16.23617], [48.007359, 16.23703], [48.007511, 16.237801], [48.00708, 16.237961], [48.006611, 16.238689], [48.005459, 16.239941], [48.005589, 16.24048], [48.005669, 16.24119], [48.005699, 16.24177], [48.005669, 16.242371], [48.005589, 16.242979], [48.00552, 16.24374], [48.005379, 16.243879], [48.005169, 16.244289], [48.005058, 16.244459], [48.00494, 16.244459], [48.004082, 16.245729], [48.00388, 16.24604], [48.00367, 16.24633], [48.003399, 16.24671], [48.003189, 16.247101], [48.002979, 16.247351], [48.002289, 16.247589], [48.00227, 16.24802], [48.002399, 16.249491], [48.002541, 16.25045], [48.002579, 16.2507], [48.002529, 16.250731], [48.002491, 16.250811], [48.002491, 16.25091], [48.002529, 16.250971], [48.002468, 16.25111], [48.002411, 16.25135], [48.002331, 16.25185], [48.00227, 16.252399], [48.002251, 16.25284], [48.002319, 16.25308], [48.002548, 16.253771], [48.00267, 16.254419], [48.00272, 16.2563], [48.00275, 16.25639], [48.002769, 16.257259], [48.002869, 16.257259], [48.00293, 16.257271], [48.003559, 16.25761]];
      })
    ;
  } //_getRoute

  function _setRouteMarker(coord, usage) {
    logger.log('setting ' + usage + ' to ' + JSON.stringify(coord), 'location - setMarker', location.start);

    var map = location.map;
    var marker, latLng, icon;
    switch (usage) {
      case 'start':
        if (location.start.marker) {
          map.removeLayer(location.start.marker);
        }

        latLng = [coord[1], coord[0]];
        icon = L.AwesomeMarkers.icon({
          prefix: "fa",
          icon: "home",
          color: "navy"
        });
        marker = L.marker(latLng);
        marker.setIcon(icon);
        marker.options.dragable = true;
        marker.options.title = "Ausgangspunkt (Start)";
        location.start.marker = marker;
        map.addLayer(marker);

        break;
      case 'end':
        if (location.end.marker) {
          map.removeLayer(location.end.marker);
        }

        latLng = [coord[1], coord[0]];
        icon = L.AwesomeMarkers.icon({
          prefix: "fa",
          icon: "flag",
          markerColor: "navy"
        });
        marker = L.marker(latLng);
        marker.setIcon(icon);
        marker.options.dragable = true;
        marker.options.title = "Ziel";
        location.end.marker = marker;
        map.addLayer(marker);
        break;
      default:
        break;
    }

  } //_setRouteMarker

  //geocodieren
  function _geoCode(searchString, writeResultTo) {
    logger.log('geocoding: ' + searchString, 'location - geoCode');

    ////google v3
    var geocoder = 'http://maps.googleapis.com/maps/api/geocode/json?address=';
    var query = searchString + '+2500+Baden+AT';
    var params = '&bounds=' + '48.0055366633946,16.226806640625|48.0104104459036,16.2411510944366'
               + '&sensor=false';

    var url = geocoder + query + params;

    return $.getJSON(url)
      .pipe(function (result, param) {
        //if (result.Status.code === 200) {
        //  writeResultTo(result.Placemark[0].Point.coordinates);
        //  logger.log('found: ' + JSON.stringify(writeResultTo) + ' param: ' + param, 'location - geoCode', location.start);
        //}
        //if (result.found) {
        //  var latLng = result.features[0].centroid.coordinates;
        //  writeResultTo([latLng[1], latLng[0]]);
        //  logger.log('found: ' + JSON.stringify(writeResultTo) + ' param: ' + param, 'location - geoCode', location.start);
        //}
        if (result.status === 'OK') {
          var res = result.results[0].geometry.location;
          writeResultTo([res.lng, res.lat]);  //observable variable to write the result to (e.g. start.coords or end.coords)
          logger.log('found: ' + JSON.stringify(writeResultTo) + ' param: ' + param, 'location - geoCode', location.start);
        }
        else {
          logger.error('COULD NOT GEOCODE (substituting): ' + result.status, 'location - geoCode'); //ToDo: Message
          if (searchString === 'Hauptplatz') {
            writeResultTo([16.2344391, 48.00768]);
            return;
          }
          else if (searchString === 'Lokalbahnzeile 67') {
            writeResultTo([16.2576435, 48.0036361]);
            return;
          }
        }
      });

  } //_geoCode

  //UI
  function _scrollList(selector) {
    var $listItem = $(selector);
    if ($listItem.length > 0) {
      $listItem.scrollIntoView({
        duration: 500,
        easing: false, //'swing', //'easeOutExpo',
        complete: $.noop(),
        step: $.noop(),
        queue: false,
        specialEasing: 'swing' //what's the difference to easing?
      });
    }
  } //_scrollList

  function _panMap(marker) { //pan the selected marker into view
    if (!location.settings.autoPan) return;
    if (!marker) { //try to find marker of selected item
      if (!location.selectedItem()) {
        return;
      }
      else {
        marker = location.selectedItem().marker;
        if (!marker) return;
      }
    } //if (!marker)

    var map = location.map;
    var size = L.point(map.getContainer().offsetWidth, map.getContainer().offsetHeight); //map.getSize();
    var padding = location.settings.mapPadding;

    var ll = marker.getLatLng();
    var pos = map.latLngToContainerPoint(ll);
    logger.log('size: ' + size.x + ', ' + size.y + '   pos: ' + pos.x + ', ' + pos.y, 'location - _panMap', {size: map.getSize(), container: size});

    var dx = 0;
    var dy = 0;
    if (pos.x + padding.right > size.x) { // right
      dx = pos.x - size.x + padding.right;
    }
    if (pos.x - dx - padding.left < 0) { // left
      dx = pos.x - padding.left;
    }
    if (pos.y + padding.bottom > size.y) { // bottom
      dy = pos.y - size.y + padding.bottom;
    }
    if (pos.y - dy - padding.top < 0) { // top
      dy = pos.y - padding.top;
    }
    if (dx || dy) {
      map.panBy([dx, dy]);
    }
  } //_panMap

  //#endregion Private Members


  //#region Public Methods

  function setView(i) {
    var map = location.map;
    var view = location.views()[i];
    var box = wktToCoords(view.Boundary().Geography.WellKnownText);
    map.fitBounds([[box[3][1], box[3][0]], [box[1][1], box[1][0]]]);
    return;
  } //setView

  function setTileLayer(index) {
    var layer = location.layers.tileLayer;
    var map = location.map;
    if (layer) {
      map.removeLayer(layer.Layer);
    }
    layer = location.settings.tileLayers[index];
    location.layers.tileLayer = layer;
    map.addLayer(layer.Layer);
  } //setTileLayer

  function initializeMap(containerId) {
    logger.log('[location] Initializing Map', 'location', containerId);

    //create map
    var map = L.map(containerId/*, { center: new L.LatLng(48.008, 16.235), zoom: 14 }*/);
    location.map = map;

    //register eventhandlers for map
    map.on({
      'move': function () {
        _drawPointer();
      }
      //, 'resize': function () {
      //  location.map.invalidateSize(true);
      //  //  //pan map
      ////  if (location.selectedItem()) {
      ////    var ll = location.selectedItem().marker.getLatLng();
      ////    location.map.panInsideBounds(L.latLngBounds(ll, ll));
      ////  }
      //}
    });

    //register eventhandlers for list
    var list = $('#locationList');
    list.scroll(function () {
      _drawPointer();
    });

    //load tile layer
    setTileLayer(0);

    //getCurrentPosition();

    //Fetch Metadata, add COMPUTED PROPERTIES and LOAD DATA
    locateContext.fetchMetadata()
      .then(function () {
        //logger.log('matadata requested', 'location');

        //Extensions for computed Properties (see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
        var Location = function () {
          this.kind = "";
          this.tags = [];
          this.open = [];
        };

        locateMetadata.registerEntityTypeCtor("Location:#onYOURway.Models", Location);

        //get regions
        _loadRegions(map);

        //TODO: change to "loadRegionFeatures"
        //_loadLocations(map);
        _loadPlaces();

        //get SearchSuggestions (maybe reintegrate with loadLocations into loadRegionFeatures)
        _loadSearchSuggestions();

      })
      .fail(function (err) {
        logger.log('matadata could not be requested:' + err.message, 'location');
      })
    ;

    //_showTransport(map);

    /* define and hook up the eventhandlers */
    //map.on('click', function (e) {
    //  location.showMessage('Map klicked at ' + JSON.stringify(e.latlng), 'Map Event');
    //});
  } //initializeMap

  function setMode(mode) {
    logger.log("changing mode to " + mode, 'location');
    //if no change do nothing
    if (location.settings.mode() === mode) return;

    //remove old mode overlay
    if (location.layers.bikeLayer) location.map.removeLayer(location.layers.bikeLayer);
    if (location.layers.transportLayer) location.map.removeLayer(location.layers.transportLayer);

    //set new mode
    location.settings.mode(mode);

    //show new mode overlay
    var query = null;
    switch (location.settings.mode()) {
      case "bike":
        if (location.layers.bikeLayer) {
          location.map.addLayer(location.layers.bikeLayer);
        }
        else {
          query = breeze.EntityQuery.from("BikeFeatures/?RegionId=1");
          return locateContext
            .executeQuery(query)
            .then(function (d) {
              var group = new L.LayerGroup();
              var ways = d.results;
              logger.log(ways.length + " ways found", 'location');
              for (var i = 0; i < ways.length; i++) {
                var way = ways[i];
                var color;
                switch (way.Mode()) {
                  case 'Route': color = '#ff0000'; break;
                  case 'Dedicated': color = '#00ff00'; break;
                  default: color = 'ff7800'; break;
                }
                var poly = L.multiPolyline(
                  L.GeoJSON.coordsToLatLngs(wktToCoords(way.Way().Geography.WellKnownText)),
                {
                  color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: (way.Name() ? true : false)
                }
                  );
                if (way.Name()) {
                  poly.bindPopup('<b>' + way.Name() + '</b>');
                }
                group.addLayer(poly);
              }
              location.map.addLayer(group);
              location.layers.bikeLayer = group;
            }) //then
            .fail(function (error) {
              logger.error("Query for Regions failed: " + error.message, 'location', error);
            });
        }
        break;
      case "walk":
        if (location.layers.transportLayer) {
          location.map.addLayer(location.layers.transportLayer);
        }
        else {
          query = breeze.EntityQuery.from("TransportFeatures/?RegionId=1");
          return locateContext
            .executeQuery(query)
            .then(function (d) {
              var group = new L.LayerGroup();
              var lines = d.results[0].Lines;
              logger.log(lines.length + " lines found", 'location');
              for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var color;
                switch (line.Mode()) {
                  case 'Route': color = '#ff0000'; break;
                  case 'Dedicated': color = '#00ff00'; break;
                  default: color = 'ff7800'; break;
                }
                var poly = L.multiPolyline(
                  L.GeoJSON.coordsToLatLngs(wktToCoords(line.Way().Geography.WellKnownText)),
                {
                  color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: true
                }
                  );
                poly.bindPopup('<b>' + line.Name() + '</b>');
                group.addLayer(poly);
              }
              location.map.addLayer(group);
              location.layers.transportLayer = group;
            }) //then
            .fail(function (error) {
              logger.error("Query for Regions failed: " + error.message, 'location', error);
            });
        }
        break;
        //default:
        //  break;
    }

    //recalculate route
    _getRoute();

  } //setMode

  function drawMarkers(map, locationsToDraw) {
    if (location.layers.locationLayer) map.removeLayer(location.layers.locationLayer);
    if (location.layers.pointerLayer) map.removeLayer(location.layers.pointerLayer);

    var group = location.settings.clusterLocations()
              ? new L.MarkerClusterGroup()
              : new L.LayerGroup();
    map.addLayer(group);
    location.layers.locationLayer = group;

    for (var i = 0; i < locationsToDraw.length; i++) {
      //console.log("[location] drawMarkers drawing marker ", locationsToDraw[i])
      _setMarker(group, null, locationsToDraw[i]);
    }

    //if(location.settings.zoomToSearchResults()) {
    //  map.fitBounds(group.getBounds());
    //}
  } //drawMarkers

  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition( //requests current position from geolocation api (HTML5 or PhoneGap)
      function (result) {
        if (result.coords) {
          location.start.coords([result.coords.longitude, result.coords.latitude]);
          location.start.text('aktueller Standort');
          _setRouteMarker(location.start.coords(), 'start');
          _setFiveMinutesInidcator(location.start.coords());
        }
      },
      function (error) {
        logger.error(error.message, 'location-getCurrentPosition');
        location.start.coords([16.2344391, 48.00768]);
        _setRouteMarker(location.start.coords(), 'start');
        _setFiveMinutesInidcator(location.start.coords());
      },
      {
        maximumAge: 300000
      }
    );
  } //getCurrentPosition

  //#region sorters

  function sortOpenThenByDistance(l1, l2) {
    var o1 = l1.isOpen();
    var o2 = l2.isOpen();

    if (o1 && !o2)
      return -1;
    else if (o2 && !o1)
      return 1;
    else
      return sortByDistance(l1, l2);
  }

  function sortFeaturedThenByDistance(l1, l2) {
    var f1 = l1.isFeatured();
    var f2 = l2.isFeatured();

    if (f1 && !f2)
      return -1;
    else if (f2 && !f1)
      return 1;
    else
      return sortByDistance(l1, l2);
  }

  function sortByDistance(l1, l2) {
    if (l1.distance && l2.distance)
      return l1.distance() > l2.distance();
    else if (l1.distance)
      return -1; //only l1 has distance so set as frst
    else if (l2.distance)
      return 1; //only l2 has distance sp set l2 as first
    else
      //return 0; //if both have no distance consider equal
      return sortByName; //if both have no distance sort by name
  }

  function sortByName(l1, l2) {
    return l1.Name() > l2.Name();
  }

  //#endregion sorters

  //like search but only by full TagNames
  function showByTagName(what) {
    //logger.log('showByTagName: ' + what, 'location');
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
  } //showByTagName

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
          if ((loc.Name && loc.Name().toLowerCase().indexOf(what) !== -1)
              ||
              (loc.Street && loc.Street().toLowerCase().indexOf(what) !== -1)
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
            //logger.log('searching', 'location', loc.Tag)
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
      logger.error(e.message, 'location', e);
    }

    router.navigate('map');
  } //search

  function locate(what) {
    var map = location.map;
    var start = location.start;
    var end = location.end;

    if (what === 'start' && start.text() === 'aktueller Standort') {
      getCurrentPosition();
      return;
    }
    if (what === 'start' && !start.text()) {
      logger.error('Geben Sie eine Position oder einen Startpunkt an.', 'location');
      return;
    }
    if (what === 'end' && !end.text()) {
      logger.error('Geben Sie eine Zieladresse an.', 'location');
      return;
    }
    if (what === 'nothing') {
      location.end.text(null);
      if (location.end.marker) map.removeLayer(location.end.marker);
      if (location.routeLayer) map.removeLayer(location.routeLayer);
      if (location.start.coords()) _setFiveMinutesInidcator(location.start.coords());
    }
    else if (what === 'start') { //Position festlegen oder Start berechnen
      _geoCode(location.start.text(), location.start.coords)   //location.start.coords ... passing function reference
        .done(function () {
          _setFiveMinutesInidcator(location.start.coords());
          _setRouteMarker(location.start.coords(), 'start');        //location.start.coords ... passing value
        });
    }
    else if (what === 'end') { //End finden und Route berechnen
      _geoCode(location.end.text(), location.end.coords)
        .done(function () {
          _setRouteMarker(location.end.coords(), 'end');
          _getRoute()
            .done(function () {
              var map = location.map;
              if (location.routeLayer) {
                map.removeLayer(location.routeLayer);
              }
              _setFiveMinutesInidcator(location.route);
              location.routeLayer = L.polyline(/*L.GeoJSON.coordsToLatLngs(*/location.route/*)*/, {
                color: '#0067a3'
              });
              map.addLayer(location.routeLayer);
            });
        });
    }

  } //locate

  function itemClick(e) {
    var oldLoc = location.selectedItem();

    //get new marker and loc(ation)
    var marker, loc;
    if (e.target) { //marker ... loc in e.target.data
      marker = this;
      loc = e.target.data;
    }
    else if (e.marker) { //bound item (e.g. locationList) ... marker in e.marker
      marker = e.marker;
      loc = this;
    }

    //if already selected toggle details and return
    if (oldLoc === loc) {
      //if ($('#ventureDetails').hasClass('detailsOpen')) {
      //  $('#ventureDetails, #locationList, #map')
      //    .removeClass('detailsOpen');
      //}
      //else {
      //  $('#ventureDetails, #locationList, #map')
      //    .addClass('detailsOpen');
      //}
      location.toggleDetails();
    }
    else {
      //restore marker of formerly selected item
      if (oldLoc) {
        oldLoc.marker
          .setIcon(_getLocationIcon(oldLoc))
          .setZIndexOffset(0)
          .setOpacity(oldLoc.isOpen() ? 1 : 0.3)
        ;
      }
      //select new item
      location.selectedItem(loc);
      //highlight new marker
      marker
        .setIcon(_getLocationIcon(loc, true))
        .setZIndexOffset(2000)
        .setOpacity(loc.isOpen() ? 1 : 0.8)
      ;
    }
    _drawPointer();

    _scrollList('#' + loc.Id());
    _panMap(marker);

  } //itemClick

  //#region control display of mapparts

  function toggleMap(mode) {
    if (mode === 'hide' || location.settings.showMap() === 'auto')
      location.settings.showMap(false);
    else
      location.settings.showMap('auto');
  }

  function toggleList(mode) {
    if (mode === 'hide' || location.settings.showList() === 'auto')
      location.settings.showList(false);
    else
      location.settings.showList('auto');
    //location.map.invalidateSize(true);
  }

  function toggleDetails(mode) {
    if (mode === 'hide' || $('#ventureDetails').hasClass('detailsOpen')) {
      location.drawPointer('hide');
      $('#ventureDetails, #locationList, #map').removeClass('detailsOpen');
      logger.log('details hidden', 'location - toggleDetails');
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
      logger.log('details opened', 'location - toggleDetails');
      setTimeout(function () { //500ms later
        location.panIntoView();
        location.drawPointer();
        //location.map.panBy([0, 0]);
      }, 500);
    }
  }

  //#endregion control display of mapparts

  function getLocation(Id) {
    var query = breeze.EntityQuery.from("Location");
    query.parameters = { Id: Id };
    return locateContext
      .executeQuery(query)
      .then(function (d) {
        var item = d.results[0];
        location.loactionToEdit(item);
      })
      .fail(function (error) {
        logger.error("Location data could not be loaded: " + error.message, 'location - getLocation', error);
      });
  } //getLocation

  function editLocation(Id) {
     location
      .getLocation(Id)
      .then(function () {
        logger.log('location loaded', 'location - editLocation', location.loactionToEdit());
        router.navigate('my/wizardNew');
      });
  } //editLocation

  //#endregion Public Methods

}); //module