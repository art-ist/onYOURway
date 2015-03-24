﻿/// <reference path="../../Scripts/r.js" />
define([
	'services/map/settings',
	'services/tell',
	'services/api/apiClient',
	'services/api/placeSearch',
	'services/api/taxonomy',
	'services/map/mapAdapter',
	'services/map/siteCollectorLayer',
	'services/map/regionLayer',
	'providers/geocode-nominatim'
], function (settings, tell, apiClient, placeSearch, taxonomy, map, siteCollectorLayer, regionLayer, geocoder) {

	var vm = function () {
		var self = this;

		self.item = null;
		self.mode = ko.observable('add');

		// currently selected region
		self.region = regionLayer.selectedRegion;

		// all categories that can be selected in the categorySelectionModal
		self.categories = taxonomy.categories;

		// country and province lookups
		self.countries = [];
		self.countryCode = null;
		self.provinces = [];

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

		//#region lifecycle callbacks

		// called by durandal when activating the view was requested / started
		self.activate = function (id) {
			tell.log('activate', 'siteCollector', id);

			if (id) { //edit
				self.mode('edit');
				apiClient.getLocation(id)
					.then(function (item) {
						self.item = item;
					});
			}
			else { //add
				self.mode('add');
				self.item = createLocation();
			}

			// hide all search results that may still be displayed on the map
			placeSearch.searchResults([]);	//TODO: chenge to hide the layer not to clear the results

			//load taxonomy
			taxonomy.loadTaxonomy();

			// enabling the site collector mode - makes map smaller and enables the site selection marker
			settings.showSiteCollector(true);
			return true;
		};

		// called by knockout.js when leaving the siteCollector view	
		self.deactivate = function (queryString) {
			// detach the currently edited entity from breeze database context
			try {
				if (self.entity && self.entity.Categories) {
					$.each(self.entity.Categories(), function (key, val) {
						try {
							if (val) {
								apiClient.detachEntity(val);
							}
						} catch (e) {
							tell.log("could not detach category", "siteCollector - deactivate", e);
						}
					});
				}
				if (self.entity) {
					apiClient.detachEntity(self.entity);
				}
			} catch (e2) {
				tell.log("could not detach entity", "siteCollector - deactivate", e2);
			}

			// setting showSiteCollector to false enlarges the map again and hides the category selection marker
			settings.showSiteCollector(false);

			// tell leaflet.js to recalculate the map size, as soon as all css animations have finished
			window.setTimeout(function () {
				map.invalidateSize();
			}, 300);
			window.setTimeout(function () {
				map.invalidateSize();
			}, 750);
		};

		//#endregion lifecycle callbacks

		// set the marker in the map based on the current address of the entity
		self.setMarker = function () {
			markerSetter();
		}

		// set the current adress of the entity based on the latitude / longitude
		self.setAddress = function () {
			addressSetter();
		}

		// save all changes of the currently edited entity to the database
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

		// drop all unsaved changes and close the siteCollector
		self.close = function () {
			try {
				self.entity && self.entityAspect && self.entity.entityAspect.rejectChanges();
			} catch (e) {
				tell.log("error rejecting changes", "siteCollector - close", e);
			}
			document.location.href = "#map";
		}

		// show / hide the categorySelectionModal
		self.toggleCategorySelection = function () {
			$('#categorySelectionModal, .modal-backdrop')
				.toggleClass('hidden');
		}

		//var supportAutogeneratedKeyForEntryCategory = function (CategoryId) {
		//    // this method must not be executed before a EntryCategory entity had been created!
		//    // http://stackoverflow.com/questions/13796855/autogenerated-keys-for-entities-with-multipart-keys

		//    var entityType = self.manager.metadataStore.getEntityType("EntryCategory");
		//    var entityGroup = self.manager._findEntityGroup(entityType);

		//    entityGroup._fixupKey = function (a1, a2) { /** nothing to fix. the autogenerated part of the key belongs to the location and thus is updated automatically */ };
		//}


		// select / unselect a category
		self.toggleCategory = function (category) {
			if (self.categories.indexOf(category) >= 0) {
				// if category is currently selected, remove it and detach from breeze
				self.categories.remove(category);
				var EntryCategory;
				$.each(self.entity.Categories(), function (key, val) {
					if (val && val.CategoryId && category && category.Id == val.CategoryId()) {
						apiClient.detachEntity(val);
					}
				});
			} else {
				// if category is not yet selected, create a new "EntryCategory" entity (as breeze doesn't support Many-To-Many relations)
				self.categories.push(category);
				self.lastCategory = apiClient.createEntity('EntryCategory', {
					Entry: self.item,
					CategoryId: category.Id
				});
				//supportAutogeneratedKeyForEntryCategory(category.Id); //I guess with Guid this is not needed anymore
			}
		} //toggleCategory

		//#region Lookups

		//provide countries data for select2
		self.getCountries = function (options) {
			if (self.countries && self.countries.length) { //already cached?
				var reg = RegExp(options.term, 'i');
				console.log();
				options.callback({
					results: $linq(self.countries).where(function (c) { return reg.test(c.text) || reg.test(c.id); }).toArray()
				});
			}
			else {
				apiClient.getCountries()
					.then(function (results) {
						self.countries = results;
						tell.log('countries', 'siteCollector', self.countries);
						var reg = RegExp(options.term, 'i');
						options.callback({
							results: $linq(results).where(function (c) { return reg.test(c.text) || reg.test(c.id); }).toArray()
						});
					});
			}
		}; //getCountries

		self.getProvinces = function (options) {
			if (self.provinces && self.provinces.length) { //already cached?
				var reg = RegExp(options.term, 'i');
				options.callback({
					results: $linq(self.provinces).where(function (c) { return reg.test(c.text) || reg.test(c.id); }).toArray()
				});
			}
			else {
				apiClient.getProvinces(self.item.CountryCode())
					.then(function (data) {
						self.provinces = data.results;
						var reg = RegExp(options.term, 'i');
						options.callback({
							results: $linq(self.provinces).where(function (c) { return reg.test(c.text) || reg.test(c.id); }).toArray()
						});
					});
			}
		}; //getProvinces

		//#endregion Lookups

		//#region Private Members

		// set the marker in the map based on the current address of the entity
		// optionally call the provided callback function on success
		var markerSetter = function (callback) {
			var addr = self.entity;
			var addr_str = (addr.Street() || '') + (addr.Street() && addr.HouseNumber() && ' ') + (addr.HouseNumber() || '')
				+ ((addr.Street() || addr.HouseNumber()) && (addr.Zip() || addr.City()) && ', ')
				+ (addr.Zip() || '') + (addr.Zip() && addr.City() && ' ') + (addr.City() || '')
				+ (addr.Country() && ', ') + (addr.Country() || '');
			geocoder.getCoords(addr_str).done(function (res) {
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
		}; //markerSetter

		// set the current adress of the entity based on the latitude / longitude
		// optionally call the provided callback function on success
		var addressSetter = function (callback) {
			geocoder.getAddress([self.longitude(), self.latitude()]).done(function (res) {
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
		}; //addressSetter

		// try to determine not yet entered address OR geolocation by geocoding 
		// save all changes to the database
		var saveChanges = function () {
			if (!self.entity.City()) {
				tell.error("Please enter the city before saving!", 'siteCollector - saveChanges');
			} else if ((!self.latitude()) || self.latitude() <= 0 || (!self.longitude()) || self.longitude() <= 0) {
				tell.error("Please select a location in the map before saving!", 'siteCollector - saveChanges');
			} else if (apiClient.hasChanges()) {
				self.entity.Position("POINT (" + self.longitude() + " " + self.latitude() + ")");
				apiClient.saveChanges()
                    .then(function () {
                    	tell.success("Thank You, the new site was successfully saved!", 'siteCollector - saveChanges');
                    	location && location.loadRegionFeatures();
                    	document.location.href = "#map";
                    })
			} else {
				tell.warn("Nothing to save - you didn't edit anything since last save", 'siteCollector - saveChanges');
			};
		} //saveChanges

		var createLocation = function () {
			// prepare a new breeze entity to be edited by this form
			return apiClient.createEntity('Location', {
				Name: '',
				Lang: apiClient.getLang(),
				RealmKey: self.realm,
				CreatedBy: 1,
				CreatedAt: new Date(),
				ModifiedBy: null,
				ModifiedAt: null,
				Country: '',
				Province: '',
				City: '',
				Zip: '',
				Street: '',
				HouseNumber: '',
				Phone: '123',
				Position: null,
				Icon: 'fa-cutlery',
				OpeningHours: null,
				Description: '',
				Type: 'SitCllctr',
				Categories: []
			});
		}; //createLocation

		var getLocation = function (id) {
			apiClient.getLocation(id)
				.then(function (item) {
					self.item = item;
				});
		}; //getLocation

		//var my_fixup = function (tempValue, realValue, CategoryId) {
		//    var ix = this._indexMap[realValue + ":::" + CategoryId]; //Changed line
		//    if (ix === undefined) {
		//        throw new Error("Internal Error in key fixup - unable to locate entity");
		//    }
		//    var entity = this._entities[ix];
		//    var keyPropName = entity.entityType.keyProperties[0].name;
		//    // fks on related entities will automatically get updated by this as well
		//    entity.setProperty(keyPropName, realValue);
		//    delete entity.entityAspect.hasTempKey;
		//    delete this._indexMap[tempValue];
		//    this._indexMap[realValue] = ix;
		//};

		//#endregion Private Members

	} // vm
	return vm;

}); //module