define([
], function () {

  // JSON proxy for NOT-CORS-enabled cross domain calls
  var proxy = '/JP.aspx?u=';

  //see: http://wiki.openstreetmap.org/wiki/YOURS
  var url = config.host + proxy + 'http://www.yournavigation.org/api/1.0/gosmore.php?format=geojson&flat={start.lat}&flon={start.lon}&tlat={end.lat}&tlon={end.lon}&v={mode}&fast=1&layer=mapnik&instructions=0&lang=en';

  var routing = {
    getRoute: getRoute
  };
  return routing;

  function getRoute(route, start, end, when, mode, via) { //TODO: add routing via stores at shopping list
    //transform mode
    if (mode === 'car') mode='motorcar'; //mode: "car", "foot", "bicycle" -> motorcar, bicycle or foot
    //set url parameters
    url = url
      .replace(/{start.lat}/g, start[1])
      .replace(/{start.lon}/g, start[0])
      .replace(/{end.lat}/g, end[1])
      .replace(/{end.lon}/g, end[0])
      .replace(/{mode}/g, mode)
      //.replace(/{lang}/g, app.lang())
    ;

    return $.ajax({
      dataType: "json",
      url: url,
      settings: { headers: { 'X-Yours-client': config.appName } }
    })
    .then(function (result) {
      route.geometry = [];
      for (var i = 0; i < result.coordinates.length; i++) {
        route.geometry.push([result.coordinates[i][1], result.coordinates[i][0]]);  //latLng to coords
      }
      //route.instructions = result.properties.description.split('<br/>'); //instructions disabled (see url)
      route.distance = result.properties.distance;
      route.duration = result.properties.traveltime;
      return route;
    });

  }//getRoute

}); //module