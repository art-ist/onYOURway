define([
  'services/tell',
], function (app, tell, platform, router, routingProvider) {

  var geoUtils = {
    wktToCoords: wktToCoords,
    coordsToWkt: coordsToWkt, //not used
    latLngToWkt: latLngToWkt,
    transformLatLongToXyMeter: transformLatLongToXyMeter, //used internally
    transformXyMeterToLatLong: transformXyMeterToLatLong
  };
  return geoUtils;


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

}); //module