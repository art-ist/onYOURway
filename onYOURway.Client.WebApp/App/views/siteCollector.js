/// <reference path="../../Scripts/r.js" />
define([
	'services/tell',
	'services/app',
	'services/api/apiClient',
	'services/api/placeSearch',
	'services/taxonomy',
	'services/map/mapAdapter',
	'services/map/settings',
	'services/map/siteCollectorLayer',
	'services/map/regionLayer',
	'providers/geocode-nominatim'
], function (tell, app, apiClient, placeSearch, taxonomy, map, settings, siteCollectorLayer, regionLayer, geocoder) {

	var vm = function () {
		var self = this;

		//item to beedited
		self.item = null;
		self.mode = ko.observable('add'); //edit

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
		self.opening_hour_block_samples = [
			'Sa 09:00-13:00',
			'Mo-Fr 09:00-18:00',
			'Mo,Tu,Th,Fr 12:00-18:00',
			'We 08:00-12:00, 14:00-20:00',
			'Mo,Tu,Th,Fr 8:00-12:00, 14:00-18:00',
			'09:00-16:00',
			'PH closed',
			'Su,PH closed'
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
			if (taxonomy.categories().length === 0) {
				//TODO: don't load both versions
				taxonomy.loadTaxonomy();	//simple localized json for picker
				//taxonomy.loadCategories();	//entities for selection
			}

			//load countries
			apiClient.getCountries()
					.then(function (results) {
						self.countries = results;
						tell.log('countries', 'siteCollector', self.countries);
					});

			// enabling the site collector mode - makes map smaller and enables the site selection marker
			settings.showSiteCollector(true);
			return true;
		};

		// called by knockout.js when leaving the siteCollector view	
		self.deactivate = function (queryString) {
			// detach the currently edited entity from breeze database context
			try {
				if (self.item && self.item.Categories) {
					$.each(self.item.Categories(), function (key, val) {
						try {
							if (val) {
								apiClient.detachEntity(val);
							}
						} catch (e) {
							tell.log("could not detach category", "siteCollector - deactivate", e);
						}
					});
				}
				if (self.item) {
					apiClient.detachEntity(self.item);
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
			if (!self.item.Name()) {
				tell.error("Please enter a name before saving", 'siteCollector - submit');
			} else if (noCoords && (!self.item.City())) {
				tell.error("Please enter the city or select a location in the map before saving!", 'siteCollector - submit');
			} else if (!self.item.City()) {
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
				self.item && self.entityAspect && self.item.entityAspect.rejectChanges();
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
			//TODO: check this
			if (self.categories.indexOf(category) >= 0) {	//TODO: fix detection
				// if category is currently selected, remove it and detach from breeze
				self.removeCategory(category);
			} else {
				// if category is not yet selected, create a new "EntryCategory" entity (as breeze doesn't support Many-To-Many relations)
				entryCategory = createEntryCategory(category);
				self.item.Categories.push(entryCategory);
				//supportAutogeneratedKeyForEntryCategory(category.Id); //I guess with Guid this is not needed anymore
			}
		} //toggleCategory

		self.removeCategory = function (entityCategory) {
			//TODO: check this
			self.item.Categories().remove(entityCategory);
			apiClient.detachEntity(val);
		}

		//#region Lookups

		//provide countries data for select2
		self.getCountries = function (options) {
			var reg = RegExp(options.term, 'i');
			options.callback({
				results: $linq(self.countries).where(function (c) { return reg.test(c.text) || reg.test(c.id); }).toArray()
			});
		}; //getCountries
		self.initCountrySelection = function (element, callback) {
			//see: http://select2.github.io/select2/ - initSelection
			var val = element.val();
			//for (var i = 0; i < self.countries.length; i++) {
			//	if (self.countries[i].id === val) {
			//		callback(self.countries[i]);
			//		return;
			//	}
			//}
			//callback(null);
			callback($linq(self.countries).where(function (c) { return c.id === val; }).firstOrDefault());
		}

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
		self.initProvinceSelection = function (element, callback) {
			//see: http://select2.github.io/select2/ - initSelection
			var val = element.val();
			callback($linq(self.provinces).where(function (c) { return c.id === val; }).firstOrDefault());
		}

		//#endregion Lookups

		//#region Private Members

		// set the marker in the map based on the current address of the entity
		// optionally call the provided callback function on success
		var markerSetter = function (callback) {
			var addr = self.item;
			var addr_str = (
				addr.Street() || '') //street
				+ (addr.Street() && addr.HouseNumber() && ' ') //add ' '
				+ (addr.HouseNumber() || '')	//number
				+ ((addr.Street() || addr.HouseNumber()) && (addr.Zip() || addr.City()) && ', ') //add ,
				+ (addr.Zip() || '') //zip
				+ (addr.Zip() && addr.City() && ' ') // add ' '
				+ (addr.City() || '') //city
				+ (addr.CountryCode() && ', ') // add ,
				+ (addr.CountryCode() || '') //country
			;
			geocoder.getCoords(addr_str).done(function (res) {
				if (res && res.coords && res.coords.length && res.coords.length > 1 && res.coords[0] && res.coords[1]) {
					self.latitude(res.coords[1]);
					self.longitude(res.coords[0]);
					if (callback) {
						callback();
					}
				} else {
					tell.error(app.getMsg('siteCollector.noPositionFound') || "Coordinates for this address could not be found. Recheck address or position marker manually.", 'siteCollector - setMarker', addr_str)
				}
			}).fail(function () {
				tell.error(app.getMsg('siteCollector.noPositionFound') || "Coordinates for this address could not be found. Recheck address or position marker manually.", 'siteCollector - setMarker', addr_str);
				return null;
			});
		}; //markerSetter

		// set the current adress of the entity based on the latitude / longitude
		// optionally call the provided callback function on success
		var addressSetter = function (callback) {
			geocoder.getAddress([self.longitude(), self.latitude()]).done(function (res) {
				var success = res /*&& res.success*/ && res.address && res.address.Country;
				tell.log("address resolved", '', res);
				if (success) {
					var addr = res.address;
					self.item.Street(addr.Street || '');
					self.item.HouseNumber(addr.HouseNumber || '');
					self.item.City(addr.City || '');
					self.item.CountryCode(addr.Country || '');
					self.item.ProvinceCode(addr.Province || '');
					self.item.Zip(addr.Zip || '');
					if (callback) {
						callback();
					}
				} else {
					tell.error(app.getMsg('siteCollector.noAddressFound') || 'No Address found for these coordinates. Please enter address manually.', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
				}
			}).fail(function () {
				tell.error('No address found for these coordinates. Please enter address manually!', 'siteCollector - setAddress', [self.longitude(), self.latitude()]);
			});
		}; //addressSetter

		// try to determine not yet entered address OR geolocation by geocoding 
		// save all changes to the database
		var saveChanges = function () {
			//if (!self.item.City()) {
			//	tell.error("Please enter the city before saving!", 'siteCollector - saveChanges');
			//}
			//else
			//if ((!self.latitude()) || self.latitude() <= 0 || (!self.longitude()) || self.longitude() <= 0) {
			//	tell.error("Please select a location in the map before saving!", 'siteCollector - saveChanges');
			//}
			//else
			if (apiClient.hasChanges()) {
				self.item.Position("POINT (" + self.longitude() + " " + self.latitude() + ")");
				apiClient.saveChanges()
					.then(function () {
						tell.success(app.getMsg('saveChangesSaveSucceeded') || "Thank You, the new site was successfully saved.", 'siteCollector - saveChanges');
						location && location.loadRegionFeatures();
						document.location.href = "#map";
					})
			} else {
				tell.warning(app.getMsg('noChangesDetected') || "Nothing to do. There where no changes since last save.", 'siteCollector - saveChanges');
			};
		} //saveChanges

		var getLocation = function (id) {
			apiClient.getLocation(id)
				.then(function (item) {
					self.item = item;
				});
		}; //getLocation

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

		var createEntryCategory = function (category) {
			var it = apiClient.createEntity('EntryCategory', {
				Entry: self.item,
				CategoryId: category.Id
			});
			apiClient.getCategory(category.Id)
				.then(function (category) {
					it.Category(category);
				});
			return it;
		} //createEntryCategory

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