define([
	'services/logger'
], function (logger) {

	//documentation:	http://wiki.openstreetmap.org/wiki/Nominatim
	// see also:		http://open.mapquestapi.com/nominatim/
	//usage policy:		http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy

	////Nominatim
	var service = 'http://nominatim.openstreetmap.org/search?format=json&limit=1&email=web@onyourway.at&q=';
	var serviceReverse = 'http://nominatim.openstreetmap.org/reverse?format=json&limit=1&email=web@onyourway.at&';

	var geocoder = {
		getCoords: getCoords,
		getAddress: getAddress
	};
	return geocoder;

	function getCoords(searchString, region) {

	    //TODO: get bounds from region
	    var rgn = region ? region() : undefined;
	    var query = searchString + (rgn && rgn.Name() == 'Baden' ? ', 2500 Baden, AT' : '');
	    var params = (rgn && rgn.Name() == 'Baden' ? ('&viewbox=' + '16.226806640625,48.0104104459036,16.2411510944366,48.0055366633946') : '')
		;
		var url = /*config.host + proxy + */ service + query + params;

		return $.ajax({
			dataType: "json",
			url: url
		})
		.then(function (result, param) {
			logger.log('found: ', 'geocode-nominatim - getCoords', result);
			var res = result[0];
			var success = (result && result.length > 0);
			//getAddress([res.lng, res.lat]);
			var coords = success ? [res.lon, res.lat] : null;
			return { success: success, coords: coords };
		});

	} //getCoords

	function getAddress(coords) { //TODO: test reverse geocoding
	    return $.ajax({
	        dataType: "json",
	        url: serviceReverse + "lat=" +coords[1] + "&lon=" + coords[0]
	    })
		.then(function (result, param) {
		    var res = result;
		    var success = (res.address == true);
		    var address = {};
		    if (res && res.address) {
		    	if (res.address.city)			address.city		= res.address.city;
		    	if (res.address.country)		address.country		= res.address.country;
		    	if (res.address.country_code)	address.country_code = res.address.country_code;
		    	if (res.address.road)			address.street		= res.address.road;
		    	if (res.address.house_number)	address.nr			= res.address.house_number;
		    	if (res.address.postcode)		address.postcode	= res.address.postcode;
		    	if (res.address.state_district) address.county		= res.address.state_district;
		    	if (res.address.state)			address.region		= res.address.state;
		    }
			// debugging 
		    alert(address.street + ' ' + address.nr + ', ' + address.country_code + '-' + address.postcode + ' ' + address.city + ', ' + address.region + ', ' + address.county + ', ' + address.country + '\n\n' + res.formatted_address);
            return { success: success, address: address, formatted_address: result.formatted_address }
		});
	}

}); //module