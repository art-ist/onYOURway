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
        self.currentArticle('#' +article);
       }
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
    self.location = {
      Name: ko.observable('Willixhofer'),
      Description: ko.observable('Willixhofer'),
      Street: ko.observable(),
      HouseNumber: ko.observable(),
      //...
      HasTag: ko.observableArray(),
      LocationLink:  ko.observableArray()
    }

    //// Operations

  };
  return vm;

}); //define