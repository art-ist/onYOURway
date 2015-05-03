define([
    'services/tell',
    'services/map/settings'
], function (tell, settings) {

	var self = {

		extendEntities: _extendEntities

	};
	return self;

	function _extendEntities(context) {
		//Extensions for computed Properties (
		// see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
		// and: http://www.breezejs.com/documentation/extending-entities
		var metadata = context.metadataStore;

		metadata.registerEntityTypeCtor("Location", Location, LocationInitializer); // "Location:#onYOURway.Models"
		metadata.registerEntityTypeCtor("Category", Category, CategoryInitializer); // "Category:#onYOURway.Models"
		metadata.registerEntityTypeCtor("EntryCategory", EntryCategory, EntryCategoryInitializer); // "EntryCategory:#onYOURway.Models"

	} //_extendEntities

	//#region Location

	Location = function () {
		//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped
	};
	var LocationInitializer = function (self) {
		self.RealmKey(settings.realm);
	}

	//#endregion Location

	//#region Category

	function Category() {
		//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped
	} //Category
	var CategoryInitializer = function (self) {
		//extensions in the post-construction initializer will be NOT made observable by breeze will NOT be exported

		var local = ko.computed({
			read: function () {
				require(['services/app'], function (app) {
					//logger.log('Local', 'mind - Node', { node: self, texts: self.Texts(), lang: app.lang() });

					//nothing there
					if (!self.Category || !self.Category() || !self.Category().Names) { return null; }

					var names = self.Category().Names();
					//empty array 
					if (!names.length) { return null; }
					//find and return first localized text
					var i = 0;
					for (i = 0; i < names.length; i++) {
						if (names[i].Lang() === app.lang()) {
							return names[i];
						}
					}
					//return first neutral Names
					for (i = 0; i < self.Names().length; i++) {
						if (!names[i].Lang || !self.Names()[i].Lang()) {
							return names[i];
						}
					}
					//return whatever you have
					return snames[0];
				});
			}
			, owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}, self); //.extend({ notify: 'always' });

		//self.Local = local;
		self.LName = ko.computed(function () { var l = local(); if (l) return l.Name(); }, self);
		self.LDescription = ko.computed(function () { var l = local(); if (l) return l.Description(); }, self);
        self.active = ko.observable(false);

	};

	//#endregion Category

	//#region EntryCategory

	function EntryCategory() {
		//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped
		this.LName = '';
		this.LDescription = '';
	} //EntryCategory

	var EntryCategoryInitializer = function (self) {
		//extensions in the post-construction initializer will be NOT made observable by breeze will NOT be exported

		var local = ko.computed({
			read: function () {
				require(['services/app'], function (app) {
					//logger.log('Local', 'mind - Node', { node: self, texts: self.Texts(), lang: app.lang() });

					//nothing there
					if (!self.Category || !self.Category() || !self.Category().Names) { return null; }

					var names = self.Category().Names();
					//empty array 
					if (!names.length) { return null; }
					//find and return first localized text
					var i = 0;
					for (i = 0; i < names.length; i++) {
						if (names[i].Lang() === app.lang()) {
							return names[i];
						}
					}
					//return first neutral Names
					for (i = 0; i < self.Names().length; i++) {
						if (!names[i].Lang || !self.Names()[i].Lang()) {
							return names[i];
						}
					}
					//return whatever you have
					return snames[0];
				});
			}
			, owner: self
			//,deferEvaluation: true //required because Entity properties are not yet defined
		}, self); //.extend({ notify: 'always' });

		//self.Local = local;
		self.LName = ko.computed(function () { var l = local(); if (l) return l.Name(); }, self);
		self.LDescription = ko.computed(function () { var l = local(); if (l) return l.Description(); }, self);
        self.active = ko.observable(false);

	};

	//#endregion EntryCategory



}); //define