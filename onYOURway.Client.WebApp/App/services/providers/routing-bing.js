define([
	'services/tell'
], function (tell) {
	//TODO: check licence

	// JSON proxy for NOT-CORS-enabled cross domain calls
	var proxy = '/JP.aspx?u=';

	//see:https://msdn.microsoft.com/en-us/library/ff701717.aspx
	var url = config.host
			//+ proxy
			+ 'http://dev.virtualearth.net/REST/v1/Routes/'
			+ '{mode}'
			+ '?wayPoint.1=wayPoint1' //start
			//+ '&viaWaypoint.2=viaWaypoint2'
			//+ '&waypoint.3=wayPoint3'
			+ '&wayPoint.n=wayPointn' //end
			//+ '&heading=heading'
			//+ '&optimize=time'		//distance, time, timeWithTraffic, timeAvoidClosure
			//+ '&avoid=avoidOptions'	//(Driving only)
			//+ '&distanceBeforeFirstTurn=distanceBeforeFirstTurn'
			+ '&routeAttributes=routeAttributes'
			//+ '&timeType=timeType'	//Arrival, Departure, LastAvailable (required for travel mode 'Transit')
			+ '&dateTime=dateTime'		//03/01/2011 05:42:00 (required for travel mode 'Transit')
			+ '&maxSolutions=1'			//1-3 (maxSolutions)
			+ '&rpo=Points'				//routePathOutput
			//+ '&tolerances=tolerance1,tolerance2,tolerancen'
			+ '&distanceUnit=km'		//km, mi
			//+ '&mfa=mfa'				//?
			+ '&key=' + config.apiKeys.bing

	var routing = {
		modes: ["car", "foot", "public"],
		getRoute: getRoute
	};
	return routing;

	function getRoute(route, start, end, when, mode, via) { //TODO: add routing VIA stores at shopping list or VIA initiatives on your way

		tell.error('NOT (YET) IMPLEMENTED', 'routing-bing');

		////transform mode (mode: "car", "foot", "bicycle", "public", "multi" -> Drivig, Walking, "Driving", Transit, "Transit"
		if (mode === 'car' || mode === 'bicycle') mode = 'Driving';
		if (mode === 'foot') mode = 'Walking'; 
		////set url parameters
		//url = url
		//  .replace(/{start.lat}/g, start[1])
		//  .replace(/{start.lon}/g, start[0])
		//  .replace(/{end.lat}/g, end[1])
		//  .replace(/{end.lon}/g, end[0])
		//  .replace(/{mode}/g, mode)
		//  //.replace(/{lang}/g, app.lang())
		//;

		//return $.ajax({
		//  dataType: "json",
		//  url: url,
		//  settings: { headers: { 'X-Yours-client': config.appName } }
		//})
		//.then(function (result) {
		//  route.geometry = [];
		//  for (var i = 0; i < result.coordinates.length; i++) {
		//    route.geometry.push([result.coordinates[i][1], result.coordinates[i][0]]);  //latLng to coords
		//  }
		//  //route.instructions = result.properties.description.split('<br/>'); //instructions disabled (see url)
		//  route.distance = result.properties.distance;
		//  route.duration = result.properties.traveltime;
		//  return route;
		//});

	}//getRoute

}); //module