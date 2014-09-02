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

            self.entity = self.manager.createEntity('Location', {
                Name: 'name',
                Lang: 'de',
                Country: 'at',
                Province: 'bad',
                City: 'Baden',
                Zip: '2500',
                Street: 'Straße',
                HouseNumber: 'Nr',
                Phone: '12345',
                CreatedBy: 1,
                CreatedAt: new Date(),
                ModifiedBy: null,
                ModifiedAt: null,
                Position: null,
                Icon: 'fa-cutlery',
                OpeningHours: null,
                Description: 'Beschreibung',
                Type: 'SitCllctr'
            });

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
                var addr = location.siteCollectorAddress();
                var entity = self.entity;
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.Street(addr.address.street);
                }
                return entity.Street() || '';
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
            deferEvaluation: false
        });
        self.nr = ko.computed({
            read: function () {
                var addr = location.siteCollectorAddress();
                var entity = self.entity;
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.HouseNumber(addr.address.nr);
                }
                return entity.HouseNumber() || '';
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
        	deferEvaluation: false
        });
        self.city = ko.computed({
            read: function () {
                var entity = self.entity;
                var addr = location.siteCollectorAddress();
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.City(addr.address.city);
                }
                return entity.City() || '';
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
            deferEvaluation: false
        });
        self.postcode = ko.computed({
            read: function () {
                var entity = self.entity;
                var addr = location.siteCollectorAddress();
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.Zip(addr.address.postcode);
                }
                return entity.Zip() || '';
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
        	    deferEvaluation: false
        });
        self.country = ko.computed({
            read: function () {
                var entity = self.entity;
                var addr = location.siteCollectorAddress();
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.Country(addr.address.country_code);
                }
                return entity.Country() || '';
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
            deferEvaluation: false
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

        self.submit = function saveChanges() {

            if (self.manager.hasChanges()) {
                self.manager.saveChanges()
                    .then(function () { alert('save success')})
                    .fail(function () { alert('save error') });
            } else {
                logger.info("Nothing to save");
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