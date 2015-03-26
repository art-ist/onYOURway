//EntryCategory
function EntryCategory() {
	//extensions in the constructor will be turned into observables by breeze and on export be serialized as unmapped

} //EntryCategory
var EntryCategoryInitializer = function (self) {
	//extensions in the post-construction initializer will be NOT made observable by breeze will NOT be exported

	var local = ko.computed({
		read: function () {
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
		}
		, owner: self
		//,deferEvaluation: true //required because Entity properties are not yet defined
	}, self); //.extend({ notify: 'always' });

	//self.Local = local;
	self.LName = ko.computed(function () { var l = local(); if (l) return l.Name(); }, self);
	self.LDescription = ko.computed(function () { var l = local(); if (l) return l.Description(); }, self);

}; //EntryCategoryInitializer