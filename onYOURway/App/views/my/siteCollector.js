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
                Zip: '5200',
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

        self.street = ko.computed({
            read: function () {
                var addr = location.siteCollectorAddress();
                var entity = self.entity;
                if (!entity) {
                    return '';
                }
                if (addr) {
                    entity.Street(addr.address.street);
                    entity.HouseNumber(addr.address.nr);
                }
                return (entity.Street() ? (entity.Street() + (entity.HouseNumber() ? ' ' : '')) : '') + (entity.HouseNumber() ? entity.HouseNumber() : '');
            },
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
                    entity.Zip(addr.address.postcode);
                    entity.City(addr.address.city);
                    entity.Country(addr.address.countryCode);
                }
                return (entity.Zip() ? (entity.Zip() + (entity.City() || entity.Country() ? ' ' : '')) : '') + (entity.City() ? entity.City() : '') + (entity.Country() ? ((entity.City() ? ', ' : '') + entity.Country()) : '')
            },
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
            deferEvaluation: false
        });

        self.setMarker = function () {
            location.setSiteCollectorMarker(this.street() + ' ' + this.city());
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

    };
    return vm;

}); //module