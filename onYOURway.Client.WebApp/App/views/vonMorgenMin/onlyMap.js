define([
    'services/api/placeSearch',
], function (search) {

    var vm = function () {
        var self = this;

        self.activate = function (searchTerm) {
            return true;
        };

    };
    return vm;

});
