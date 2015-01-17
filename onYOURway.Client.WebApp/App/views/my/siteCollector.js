/// <reference path="../../Scripts/r.js" />
define([
  'services/app',
  'services/location',
  'services/tell',
  'services/api/apiClient',
  'services/map/siteCollectorLayer',
  'providers/geocode-nominatim'
], function (app, location, tell, apiClient, siteCollectorLayer, geocodingProvider) {

	var vm = function () {
		var self = this;
		self.app = app;
		self.location = location;

        // breeze database context
		self.manager = apiClient.locateContext;

        // list of regions - these regions can be selected in the region drop down
		self.region = ko.observable(3);

	    // all tags that can be selected in the tagSelectionModal
		self.taxonomy = ko.observableArray([]);

        // countries that can be selected in the country dropdown
		self.countries = apiClient.getCountries();

        // opening hours that can be selected in the opening hours dropdown
		self.opening_hour_samples = [
			'Mo-Fr 09:00-18:00; PH closed',
			'Mo-Fr 09:00-19:00; Sa 09:00-13:00; PH closed',
			'Mo,Tu,Th,Fr 12:00-18:00; Sa 12:00-17:00; PH closed',
			'Mo,Tu,Th,Fr 8:00-12:00, 14:00-18:00; We 08:00-12:00, 14:00-20:00; Sa 08:00-16:00; PH closed',
			'09:00-16:00; Su,PH closed'
		];

	    // computed observable connects the latitude input field with siteCollectorLayer.markerGeoLocation (which is connected to the map marker)
		self.latitude = ko.computed({
			read: function () {
				return siteCollectorLayer.markerGeoLocation() && siteCollectorLayer.markerGeoLocation().lat;
			},
			write: function (lat) {
				if (!lat) {
					lat = 0.0;
				}
				var lng = siteCollectorLayer.markerGeoLocation() && siteCollectorLayer.markerGeoLocation().lng || 0.0;
				siteCollectorLayer.markerGeoLocation({ lat: lat, lng: lng });
			}
		});

	    // computed observable connects the longitude input field with siteCollectorLayer.markerGeoLocation (which is connected to the map marker)
		self.longitude = ko.computed({
			read: function () {
				return siteCollectorLayer.markerGeoLocation() && siteCollectorLayer.markerGeoLocation().lng;
			},
			write: function (lng) {
				if (!lng) {
					lat = 0.0;
				}
				var lat = siteCollectorLayer.markerGeoLocation() && siteCollectorLayer.markerGeoLocation().lat || 0.0;
				siteCollectorLayer.markerGeoLocation({ lat: lat, lng: lng });
			}
		});

	    /**
        * set the marker in the map based on the current address of the entity
        */
		self.setMarker = function () {
		    markerSetter();
		}

	    /**
         * set the current adress of the entity based on the latitude / longitude
         */
		self.setAddress = function () {
		    addressSetter();
		}

        /**
         * save all changes of the currently edited entity to the database
         */
		self.submit = function () {
		    var noCoords = (!self.latitude()) || self.latitude() <= 0 || (!self.longitude()) || self.longitude() <= 0;
		    if (!self.entity.Name()) {
		        tell.error("Please enter a name before saving", 'siteCollector - submit');
		    } else if (noCoords && (!self.entity.City())) {
		        tell.error("Please enter the city or select a location in the map before saving!", 'siteCollector - submit');
		    } else if (!self.entity.City()) {
		        addressSetter(saveChanges);
		    } else if (noCoords) {
		        markerSetter(saveChanges);
		    } else {
		        saveChanges();
		    }
		};

        /**
         * drop all unsaved changes and close the siteCollector
         */
		self.close = function () {
		    try {
		        self.entity && self.entityAspect && self.entity.entityAspect.rejectChanges();
		    } catch (e) {
		        tell.log("error rejecting changes", "siteCollector - close", e);
		    }
		    document.location.href = "#map";
		}

        /**
         * show / hide the tagSelectionModal
         */
		self.toggleTagSelection = function () {
		    $('#tagSelectionModal, .modal-backdrop')
				.toggleClass('hidden');
		}

        /**
         * select / unselect a tag
         */
		self.toggleTag = function (tag) {
		    if (self.tags.indexOf(tag) >= 0) {
                // if tag is currently selected, remove it and detach from breeze
		        self.tags.remove(tag);
		        var hasTag;
		        $.each(self.entity.Tags(), function (key, val) {
		            if (val && val.TagId && tag && tag.Id == val.TagId()) {
		                self.manager.detachEntity(val);
		            }
		        });
		    } else {
                // if tag is not yet selected, create a new "HasTag" entity (as breeze doesn't support Many-To-Many relations)
		        self.tags.push(tag);
		        self.manager.createEntity('HasTag', {
		            Location: self.entity,
		            TagId: tag.Id
		        });
		    }
		}


	    //#region lifecycle callbacks

	    /**
         * called by knockout.js when activating the view was requested / started
         */
		self.activate = function (queryString) {
		    tell.log('activate', 'siteCollector', queryString);
		    if (queryString && queryString.tag) {
		        location.showByTagName(queryString.tag);
		    }

		    // hide all search results that may still be displayed on the map
		    location.mapLocations([]);

			//subscribe region changes to load the corresponding taxonomy
		    self.region.subscribe(function (value) {
		    	getTaxonomy();
		    });
		    app.lang.subscribe(function (value) {
		    	getTaxonomy();
		    });

		    // enabling the site collector mode - makes map smaller and enables the site selection marker
		    location.settings.showSiteCollector(true);
		    return true;
		};

	    /**
         * called by knockout.js just before the view-model binding takes place
         */
		self.binding = function () {
		    tell.log('binder', 'siteCollector');

		    // prepare a new breeze entity to be edited by this form
		    self.entity = self.manager.createEntity('Location', {
		        Name: '',
		        Lang: 'de',
		        Country: '',
		        Province: '',
		        City: '',
		        Zip: '',
		        Street: '',
		        HouseNumber: '',
		        Phone: '123',
		        CreatedBy: 1,
		        CreatedAt: new Date(),
		        ModifiedBy: null,
		        ModifiedAt: null,
		        Position: null,
		        Icon: 'fa-cutlery',
		        OpeningHours: null,
		        Description: '',
		        Type: 'SitCllctr',
		        Tags: []
		    });

		    // prepare the list of tags that have been selected by the user
		    self.tags = ko.observableArray();

		    return true;
		};

	    /**
         * called by knockout.js when leaving the siteCollector view
         */
		self.deactivate = function (queryString) {
		    // detach the currently edited entity from breeze database context
		    try {
		        if (self.entity && self.entity.Tags) {
		            $.each(self.entity.Tags(), function (key, val) {
		                try {
		                    if (val) {
		                        self.manager.detachEntity(val);
		                    }
		                } catch (e) {
		                    tell.log("could not detach tag", "siteCollector - deactivate", e);
		                }
		            });
		        }
		        if (self.entity) {
		            self.manager.detachEntity(self.entity);
		        }
		    } catch (e2) {
		        tell.log("could not detach entity", "siteCollector - deactivate", e2);
		    }

		    // setting showSiteCollector to false enlarges the map again and hides the tag selection marker
		    location.settings.showSiteCollector(false);

		    // tell leaflet.js to recalculate the map size, as soon as all css animations have finished
		    window.setTimeout(function () {
		        location.map && location.map.invalidateSize();
		    }, 300 );
		    window.setTimeout(function () {
		        location.map && location.map.invalidateSize();
		    }, 750 );
		};

	    //#endregion lifecycle callbacks

	    /**
         * initialize the list of regions (self.region)
         */
		var getRegions = function (query) {
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

		/**
         * get the hierarchy of assignable tags (self.taxonomy)
         */
		var getTaxonomy = function () {
			apiClient.getTaxonomy(self.region(), app.lang())
				.then(function (d) {
					tell.log(d.results.length + " taxonomy loaded", 'siteCollector - binding', d.results);
					self.taxonomy(d.results[0].tags.tag);
				})
		}

        /** 
         * set the marker in the map based on the current address of the entity
         * optionally call the provided callback function on success
         */
		var markerSetter = function (callback) {
			var addr = self.entity;
			var addr_str = (addr.Street() || '') + (addr.Street() && addr.HouseNumber() && ' ') + (addr.HouseNumber() || '')
				+ ((addr.Street() || addr.HouseNumber()) && (addr.Zip() || addr.City()) && ', ')
				+ (addr.Zip() || '') + (addr.Zip() && addr.City() && ' ') + (addr.City() || '')
				+ (addr.Country() && ', ') + (addr.Country() || '');
			geocodingProvider.getCoords(addr_str).done(function (res) {
				if (res && res.coords && res.coords.length && res.coords.length > 1 && res.coords[0] && res.coords[1]) {
					self.latitude(res.coords[1]);
					self.longitude(res.coords[0]);
					if (callback) {
						callback();
					}
				} else {
					tell.warn("Empty Coordinates received for address", 'siteCollector - setMarker', addr_str)
				}
			}).fail(function () {
				tell.warn('Coordinates not found for this address. Please select location manually!', 'siteCollector - setMarker', addr_str);
				return null;
			});
		};

        /**
         * set the current adress of the entity based on the latitude / longitude
         * optionally call the provided callback function on success
         */
		var addressSetter = function (callback) {
			geocodingProvider.getAddress([self.longitude(), self.latitude()]).done(function (res) {
				var addr = res && res.address;
				if (addr) {
					self.entity.Street(addr.Street || '');
					self.entity.HouseNumber(addr.HouseNumber || '');
					self.entity.City(addr.City || '');
					self.entity.Country(addr.Country || '');
					self.entity.Province(addr.Province || '');
					self.entity.Zip(addr.Zip || '');
					if (callback) {
						callback();
					}
				} else {
					tell.warn('Address not found for these coordinates. Please enter address manually!', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
				}
			}).fail(function () {
				tell.warn('No address found for these coordinates. Please enter address manually!', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
			});
		};

        /** 
         * try to determine not yet entered address OR geolocation by geocoding 
         * save all changes to the database
         */
		var saveChanges = function () {
			if (!self.entity.City()) {
				tell.error("Please enter the city before saving!", 'siteCollector - saveChanges');
			} else if ((!self.latitude()) || self.latitude() <= 0 || (!self.longitude()) || self.longitude() <= 0) {
				tell.error("Please select a location in the map before saving!", 'siteCollector - saveChanges');
			} else if (self.manager.hasChanges()) {
				self.entity.Position("POINT (" + self.longitude() + " " + self.latitude() + ")");
				self.manager.saveChanges()
                    .then(function () {
                        tell.success("Thank You, the new site was successfully saved!", 'siteCollector - saveChanges');
                        location.loadRegionFeatures();
                        document.location.href = "#map";
                    })
                    .fail(function (err) {
                    	tell.error("There was an error saving your new site. Please try again.", 'siteCollector - saveChanges', err);
                    });
			} else {
				tell.warn("Nothing to save - you didn't edit anything since last save", 'siteCollector - saveChanges');
			};
		}

	};
	return vm;

}); //module