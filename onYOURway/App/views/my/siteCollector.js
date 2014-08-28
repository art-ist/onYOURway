/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/location',
  'services/logger',
], function (app, location, logger, platform) {

    var vm = function () {
        var self = this;
        self.app = app;
        self.location = location;

		//lifecycle callbacks
        self.activate = function (queryString) {
            logger.log('activate', 'siteCollector', queryString);
            if (queryString && queryString.tag) {
                location.showByTagName(queryString.tag);
            }
            location.mapLocations([]);
            location.siteCollectorMode(true);
            return true;
        };

        self.deactivate = function (queryString) {
            location.siteCollectorMode(false);
        };

		//breeze Entity for location/site/place
        site = ko.observable();

		//#region address
        self.street = ko.computed({
        	read: function () {
        		return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ?
					location.siteCollectorAddress().address.street : '';
        	},
            write: function (arg) {
                var val = location.siteCollectorAddress();
                if (val && val.address) {
                    val.address.street = arg;
                } else {
                    val = { address: { street: arg } };
                }
                location.siteCollectorAddress(val);
            },
            deferEvaluation: true
        });
        self.nr = ko.computed({
        	read: function () {
        		return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ?
					location.siteCollectorAddress().address.nr : ''; //TODO: wird die (neue?) Verwendung von Hausnummern bei der Geolokation richtig umgesetzt?
        	},
        	write: function (arg) {
        		var val = location.siteCollectorAddress();
        		if (val && val.address) {
        			val.address.nr = arg;
        		} else {
        			val = { address: { nr: arg } };
        		}
        		location.siteCollectorAddress(val);
        	},
        	deferEvaluation: true
        });
        self.city = ko.computed({
        	read: function () {
        		return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ?
					location.siteCollectorAddress().address.city : '';
        	},
            write: function (arg) {
                var val = location.siteCollectorAddress();
                if (val && val.address) {
                    val.address.city = arg;
                } else {
                    val = { address: { city: arg } };
                }
                location.siteCollectorAddress(val);
            },
            deferEvaluation: true
        });
        self.postcode = ko.computed({
        	read: function () {
        		return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ? 
					location.siteCollectorAddress().address.postcode : '';
        	},
        	write: function (arg) {
        		var val = location.siteCollectorAddress();
        		if (val) {
        			val.address.postcode = arg;
        		} else {
        			val = { address: { postcode: arg } };
        		}
        		location.siteCollectorAddress(val);
        	},
        	deferEvaluation: true
        });
        self.country = ko.computed({
        	read: function () {
        		return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ?
					location.siteCollectorAddress().address.country : '';
        	},
        	write: function (arg) {
        		var val = location.siteCollectorAddress();
        		if (val) {
        			val.address.country = '';
        		} else {
        			val = { address: { country: arg } };
        		}
        		location.siteCollectorAddress(val);
        	},
        	deferEvaluation: true
        });
    	//#endregion address

    	//#region position

        self.lat = ko.computed({
        	read: function () {
        		var ll = location.siteCollectorMarker ? location.siteCollectorMarker().getLatLng() : null;
        		return ll ? ll.lat : null;
        	},
        	write: function (arg) {
        		var val = location.setSiteCollectorMarker();
        		var newLatLng = new L.LatLng(arg, val.getLatLng().lng);
        		val.setLatLng(newLatLng);
        		//if (self.addressModeAuto) { //update address only if not entered manually (TODO)
        		//	location.siteCollectorAddress(val);
        		//}
        	},
        	deferEvaluation: true
        });

        self.lng = ko.computed({
        	read: function () {
        		var ll = location.siteCollectorMarker ? location.siteCollectorMarker().getLatLng() : null;
        		return ll ? ll.lng : null;
        	},
        	write: function (arg) {
        		var val = location.setSiteCollectorMarker();
        		var newLatLng = new L.LatLng(val.getLatLng().lat, arg);
        		val.setLatLng(newLatLng);
        		//if (self.addressModeAuto) { //update address only if not entered manually (TODO)
        		//	location.siteCollectorAddress(val);
        		//}
        	},
        	deferEvaluation: true
        });

		//#endregion position

        self.setMarker = function () {
            //location.setSiteCollectorMarker(this.street() + ' ' + this.city());
        	location.setSiteCollectorMarker(location.siteCollectorAddress());
        }

    };
    return vm;

}); //module