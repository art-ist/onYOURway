define([
  'services/logger',
  'services/app',
  'services/location',
  'services/auth'
], function (logger, app, location, auth) {

	var vm = function () {
		var self = this;

		//#region lifecycle

		self.activate = function (article, sub, parameters) {
			if (article) {
				self.currentArticle('#' + article);
			}

			logger.log('Wizard activated', '_locationWizard  - activate', app.location.loactionToEdit());
			//app.location
			//  .getLocation(138)
			//  .then(function () {
			//    logger.log('location assigned', '_locationWizard  - activate', app.location.loactionToEdit());
			//  });

			return true;
		};

		//self.attached = function (p1, p2, p3) { //Parameters

		//	return true;
		//};

		//#endregion lifecycle

		//// UI state
		self.currentArticle = ko.observable('#uebersicht');

		//// Properties
		self.app = app;
		self.location = location.selectedItem;
		self.OpeningHours_Entries = ko.computed({
			read: function () {
				if (self.location().OpeningHours()) {
					return self.location().OpeningHours().split(';');
				}
				else {
					return[];
				}
			},
			write: function (value) {
				if (value[0])
					return value.join('; ')
			},
			owner: self
		});

		//// Methods
		self.addAlias = addAlias;
		self.removeAlias = removeAlias;

	};
	return vm;

	//#region complex Properties

	//#region Alias
	function addAlias() {
		var item = app.location.context.createEntity("LocationAlias:#onYOURway.Models");
		vm.location().Aliases.push(item);
	}
	function removeAlias(item) {
		logger.log('Removing alias', '_locationWizard - removeAlias', item);
		vm.location().Aliases.remove(item);
	}
	//#endregion Alias

	//#region OpeningHours

	function addOpeningHours_Block() {
		OpeningHours_Entries.push('');
	}
	function removeOpeningHours_Block(item) {
		OpeningHours_Entries.remove(item);
	}

	//#endregion OpeningHours

	//#endregion complex Properties

}); //define