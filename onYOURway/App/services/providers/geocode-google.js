define([
], function () {

	//// JSON proxy for NOT-CORS-enabled cross domain calls
	//var proxy = 'JP.aspx?u=';

	////google v3
	var service = 'http://maps.googleapis.com/maps/api/geocode/json?address=';

	var geocoder = {
		getCoords: getCoords,
		getAddress: getAddress
	};
	return geocoder;

	function getCoords(searchString, region) {

		//TODO: get bounds from region
		var query = searchString + '+2500+Baden+AT';
		var params = '&bounds=' + '48.0055366633946,16.226806640625|48.0104104459036,16.2411510944366'
				   + '&sensor=false';
		var url = /*config.host + proxy + */ service + query + params;

		return $.ajax({
			dataType: "json",
			url: url
		})
		.then(function (result, param) {
			var res = result.results[0].geometry.location;
			var success = (result.status === 'OK');
			return { success: success, coords: [res.lng, res.lat] }
		});

	} //getCoords

	function getAddress(coords) {
		//TODO: implement reverse geocoding
	}

}); //module