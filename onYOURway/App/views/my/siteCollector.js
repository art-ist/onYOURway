﻿/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/location',
  'services/logger',
  'providers/geocode-nominatim',
], function (app, location, logger, geocodingProvider) {

    var vm = function () {
        var self = this;
        self.app = app;
        self.location = location;
        self.manager = location.context;
        self.region = ko.observable(3);

    	getRegions = function (query) {
    		if (query && query.term) {
    			var s = location.regions();
    			var data = [];
    			var data2 = [];
    			var i;
    			for (i = 0; i < s.length; i++) {
    				if (s[i]) {
    					var idx = s[i].toLowerCase().indexOf(query.term.toLowerCase());
    					if (idx == 0) {
    						data.push({ id: s[i], text: s[i] });
    					} else if (idx > 0) {
    						data2.push({ id: s[i], text: s[i] });
    					}
    				}
    			}
    			for (i = 0; i < data2.length; i++) {
    				data.push(data2[i]);
    			}
    			query.callback({ results: data });
    		}
    	};

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

    	    self.binding = function () {
    	        logger.log('binder', 'siteCollector');
            self.entity = self.manager.createEntity('Location', {
                Name: '',
                Lang: '',
                Country: '',
                Province: '',
                City: '',
                Zip: '',
                Street: '',
                HouseNumber: '',
                Phone: '',
                CreatedBy: 1,
                CreatedAt: new Date(),
                ModifiedBy: null,
                ModifiedAt: null,
                Position: null,
                Icon: 'fa-cutlery',
                OpeningHours: null,
                Description: '',
                Type: 'SitCllctr'
            });

            return true;
        };  

        self.deactivate = function (queryString) {
            location.siteCollectorMode(false);
        };

		//breeze Entity for location/site/place
        site = ko.observable();

    	//#region opening_hours

        self.opening_hour_samples = [
			'Mo-Fr 09:00-18:00; PH closed',
			'Mo-Fr 09:00-19:00; Sa 09:00-13:00; PH closed',
			'Mo,Tu,Th,Fr 12:00-18:00; Sa 12:00-17:00; PH closed',
			'Mo,Tu,Th,Fr 8:00-12:00, 14:00-18:00; We 08:00-12:00, 14:00-20:00; Sa 08:00-16:00; PH closed',
			'09:00-16:00; Su,PH closed'
        ];

        //#endregion opening_hours

        self.latitude = ko.computed({
            read: function () {
                return location.siteCollectorCoords() && location.siteCollectorCoords().lat;
            },
            write: function (lat) {
                var lng = location.siteCollectorCoords() && location.siteCollectorCoords().lng;
                if (self.entity && self.entity.Position) {
                    self.entity.Position("POINT (" + lng + " " + lat + ")");
                }
                location.siteCollectorCoords({ lat: lat, lng: lng });
            }
        });

        self.longitude = ko.computed({
            read: function () {
                return location.siteCollectorCoords() && location.siteCollectorCoords().lng;
            },
            write: function (lng) {
                var lat = location.siteCollectorCoords() && location.siteCollectorCoords().lat;
                if (self.entity && self.entity.Position) {
                    self.entity.Position("POINT (" + lng + " " + lat + ")");
                }
                location.siteCollectorCoords({ lat: lat, lng: lng });
            }
        });

        self.setMarker = function () {
            var addr = self.entity;
            var addr_str = (addr.Street() || '') + (addr.Street() && addr.HouseNumber() && ' ') + (addr.HouseNumber() || '')
                + ((addr.Street() || addr.HouseNumber()) && (addr.Zip() || addr.City()) && ', ')
                + (addr.Zip() || '') + (addr.Zip() && addr.City() && ' ') + (addr.City() || '')
                + (addr.Country() && ', ') + (addr.Country() || '');
            geocodingProvider.getCoords(addr_str).done(function (res) {
                if (res && res.coords && res.coords.length && res.coords.length > 1 && res.coords[0] && res.coords[1]) {
                    self.latitude(res.coords[1]);
                    self.longitude(res.coords[0]);
                } else {
                    //toastr.warning("No coordinates found for this address. Please select location manually!");
                    logger.warn("Empty Coordinates received for address", 'siteCollector - setMarker', addr_str)
                }
            }).fail(function () {
                //toastr.warning("No coordinates found for this address. Please select location manually!", undefined, undefined, true);
                logger.warn('Coordinates not found for this address. Please select location manually!', 'siteCollector - setMarker', addr_str);
                return null;
            });
        };

        self.setAddress = function () {
            geocodingProvider.getAddress([self.longitude(), self.latitude()]).done(function (res) {
                var addr = res && res.address;
                if (addr) {
                    self.entity.Street(addr.Street || '');
                    self.entity.HouseNumber(addr.HouseNumber || '');
                    self.entity.City(addr.City || '');
                    self.entity.Country(addr.Country || '');
                    self.entity.Province(addr.Province || '');
                    self.entity.Zip(addr.Zip || '');
                } else {
                    //toastr.warning("No address found for these coordinates. Please enter address manually!", undefined, undefined, true);
                    logger.warn('Address not found for these coordinates. Please enter address manually!', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
                }
            }).fail(function () {
                //toastr.warning("No address found for these coordinates. Please enter address manually!", undefined, undefined, true);
                logger.warn('No address found for these coordinates. Please enter address manually!', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
            });
        };

        self.submit = function saveChanges() {
            if (!self.entity.City()) {
            } else if (self.latitude() <= 0 || self.longitude <= 0) {

            } else if (self.manager.hasChanges()) {
                self.manager.saveChanges()
                    .then(function () {
                        logger.success("Thank You, the new site was successfully saved!", 'siteCollector - submit');
                        //toastr.success("Thank You, the new site was successfully saved!", undefined, undefined, true);
                    })
                    .fail(function () {
                        logger.error("There was an error saving your new site. Please try again.", 'siteCollector - submit');
                        //toastr.error("There was an error saving your new site. Please try again.", undefined, undefined, true);
                    });
            } else {
                logger.warn("Nothing to save - you didn't edit anything since last save", 'siteCollector - submit');
                //toastr.warning("Nothing to save - you didn't edit anything since last save", undefined, undefined, true);
            };
        };

        self.toggleTagSelection = function () {
        	$('#tagSelectionModal, .modal-backdrop')
				.toggleClass('hidden');
        }

        self.addTags = function () {       	
        	self.toggleTagSelection();
        }

    };
    return vm;

}); //module