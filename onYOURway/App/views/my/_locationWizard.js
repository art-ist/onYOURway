define([
  'services/logger',
  'services/app',
  'services/auth'
], function (logger, app, auth) {

  var vm = function () {
    var self = this;

    self.app = app;

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

    self.attached = function (p1, p2, p3) {
      //logger.log('view attached', 'profile', { 'p1': p1, 'p2': p2, 'p3': p3 });
      app.navigateInPage(function navigated(href, target) {
        self.currentArticle(href); //set vm property so databinding can use it
      });

      ////initialize slideshow
      //  self.step = $("#neu")
      //    .owlCarousel({          //initialize carousel (see: http://www.owlgraphic.com/owlcarousel/#customizing)
      //      navigation: false, // Show next and prev buttons
      //      slideSpeed: 500,
      //      paginationSpeed: 400,
      //      singleItem: true,
      //      rewindNav: false
      //    })
      //  .data('owlCarousel')    //get instance of the api in self-idea
      //    ;
      //  $('.owl-pagination').appendTo($('#step_pagination'));

      return true;
    };

    //// UI state
    self.currentArticle = ko.observable('#uebersicht');

    //// Data
    self.location = app.location.loactionToEdit;

    self.addAlias = addAlias;
    self.removeAlias = removeAlias;

  };
  return vm;

  function addAlias() {
    var item = app.location.context.createEntity("LocationAlias:#onYOURway.Models");
    app.location.loactionToEdit().Aliases.push(item);
  }
  function removeAlias(item) {
    logger.log('Removing alias', '_locationWizard - removeAlias', item);
    app.location.loactionToEdit().Aliases.remove(item);
  }

}); //define