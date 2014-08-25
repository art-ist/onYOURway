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

        self.street = ko.computed({
            read: function () { return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ? ((location.siteCollectorAddress().address.street ? location.siteCollectorAddress().address.street : '') + ' ' + (location.siteCollectorAddress().address.nr ? location.siteCollectorAddress().address.nr : '')) : '' },
            write: function (arg) {
                var val = location.siteCollectorAddress();
                if (val && val.address) {
                    val.address.street = arg;
                    val.address.nr = '';
                } else {
                    val = { address: { street: arg } };
                }
                location.siteCollectorAddress(val);
            },
            deferEvaluation: true
        });
        self.city = ko.computed({
            read: function () { return location.siteCollectorAddress && location.siteCollectorAddress() && location.siteCollectorAddress().address ? ((location.siteCollectorAddress().address.postcode ? (location.siteCollectorAddress().address.postcode + ' ') : '') + (location.siteCollectorAddress().address.city ? location.siteCollectorAddress().address.city : '') + (location.siteCollectorAddress().address.country ? ((location.siteCollectorAddress().address.city ? ', ' : '') + location.siteCollectorAddress().address.country) : '')) : '' },
            write: function (arg) {
                var val = location.siteCollectorAddress();
                if (val && val.address) {
                    val.address.city = arg;
                    val.address.postcode = '';
                    val.address.country = '';
                } else {
                    val = { address: { city: arg } };
                }
                location.siteCollectorAddress(val);
            },
            deferEvaluation: true
        });

        self.setMarker = function () {
            location.setSiteCollectorMarker(this.street() + ' ' + this.city());
        }

    };
    return vm;

}); //module