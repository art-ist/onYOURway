define([
], function () {

	////google v3
    var service = 'http://maps.googleapis.com/maps/api/geocode/json?address=';
    var serviceReverse = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=';

	var geocoder = {
		getCoords: getCoords,
		getAddress: getAddress
	};
	return geocoder;

	function getCoords(searchString, region) {

	    //TODO: get bounds from region
	    var rgn = region ? region() : undefined;
	    var query = searchString + (rgn && rgn.Name() == 'Baden bei Wien' ? '+2500+Baden+AT' : '');
	    var params = (rgn && rgn.Name() == 'Baden bei Wien' ? ('&bounds=' + '48.0055366633946,16.226806640625|48.0104104459036,16.2411510944366') : '')
				   + '&sensor=false';
		var url = /*config.host + proxy + */ service + query + params;

		return $.ajax({
			dataType: "json",
			url: url
		})
		.then(function (result, param) {
			var res = result.results[0].geometry.location;
			var success = (result.status === 'OK');
			getAddress([res.lng, res.lat]);
			return { success: success, coords: [res.lng, res.lat] }
		});

	} //getCoords

	function getAddress(coords) {
	    return $.ajax({
	        dataType: "json",
	        url: serviceReverse + coords[1] + "," + coords[0]
	    })
		.then(function (result, param) {
		    var res = result.results[0];
		    var success = (result.status === 'OK');
		    var address = {};
		    if (res && res.address_components) {
		        $.each(res.address_components, function (index, val) {
		            if (val.types) {
		                $.each(val.types, function (index2, valType) {
		                    if (valType == "locality") {
		                        address.city = val.long_name;
		                    } else if (valType == "country") {
		                        address.country = val.long_name;
		                        address.country_code = val.short_name;
		                    } else if (valType == "street" || valType == "route") {
		                        address.street = val.long_name;
		                    } else if (valType == "street_number") {
		                        address.nr = val.long_name;
		                    } else if (valType == "postal_code") {
		                        address.postcode = val.long_name;
		                    } else if (valType == "administrative_area_level_1") {
		                        address.county = val.long_name;
		                    } else if (valType == "administrative_area_level_2") {
		                        address.region = val.long_name;
		                    }
		                });
		            }
		        });
		    }
		    // debugging alert(address.street + ' ' + address.nr + ', ' + address.country_code + '-' + address.postcode + ' ' + address.city + ', ' + address.region + ', ' + address.county + ', ' + address.country + '\n\n' + res.formatted_address);
            return { success: success, address: address, formatted_address: result.formatted_address }
		});
	}

}); //module