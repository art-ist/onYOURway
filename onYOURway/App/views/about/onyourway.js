define([
  'services/logger',
  'services/app',

], function (logger, app) {

  function resizeIframe(selector) {
    var frame = $(selector);
    var parent = frame.parent();
    frame
      .width(parent.width())
      .height(parent.height());
  }

  var vm = function () {
    var self = this;
    self.app = app;
    self.title = 'onYOURway';

    self.currentArticle = ko.observable('#idee');
    self.idea = null;

    self.FirstName = "";
    self.LastName = "";
    self.Company = "";
    self.Email = "";
    self.Role = "";
    self.Project = "";
    self.Message = "";

    self.sendQuest1 = (new Date()).getMilliseconds() % 9;
    self.sendQuest2 = (new Date()).getSeconds() % 9;
    self.res = ko.observable();
    self.sendQuestSolved = ko.computed(function () {
      return self.sendQuest1 + self.sendQuest2 == self.res();
    });

    //#region lifecycle events

    self.activate = function (article) {
      //logger.log('View activated', self.title);
      if (article) {
        self.currentArticle('#' + article);
      }
      return;
    };

    self.attached = function () {
      //initialize article scroll
      app.navigateInPage(function afterNavigate(href, target) {
        self.currentArticle(href); //set vm property so databinding can use it
      });

      //initialize slideshow
      self.idea = $("#idee")
        .owlCarousel({          //initialize carousel (see: http://www.owlgraphic.com/owlcarousel/#customizing)
          navigation: false, // Show next and prev buttons
          slideSpeed: 500,
          paginationSpeed: 400,
          singleItem: true,
          rewindNav: false
        })
        .data('owlCarousel')    //get instance of the api in self-idea
      ;
      $('.owl-pagination').appendTo($('#step_pagination'));

      return true;
    };

    self.compositionComplete = function () {
      var target = $(self.currentArticle());
      //logger.log('scrolling to ' + self.currentArticle(), 'profile', target);
      if(target) $('.oyw-content-main').scrollTo(target, { offset: 0, duration: app.settings.animationDuration });
      $('.oyw-content-nav a[href="' + self.currentArticle() + '"]').parent('li').addClass('active');
      return true;
    }

    //#endregion lifecycle events

    //#region methods

    self.nextIdea = function () { self.idea.next(); };
    self.prevIdea = function () { self.idea.prev(); };
    self.firstIdea = function () { self.idea.goTo(0); };

    self.send = function () {
      if (!self.sendQuestSolved()) {
        logger.logError('Sicherheitsabfrage nicht korrekt ausgefüllt.');
        return;
      }
      $.ajax({
        url: config.host + '/api/my/Notify',
        type: 'POST',
        contentType: 'application/json',
        data: {
          FirstName: self.FirstName, 
          LastName: self.LastName,
          Company: self.Company,
          Email: self.Email,
          Role: self.Role,
          Project: self.Project,
          Message: self.Message,
          a: self.sendQuest1,
          b: self.sendQuest2,
          c: self.res()
        },
        success: function (result) {
          logger.success('Nachricht gesendet.');
          self.res(null);
        },
        error: function (err) {
          logger.error('Die Nachricht kann zurzeit leider nicht gesendet werden. Aber Sie können gerne ein Email an info.');
          self.res(null);
        }
      });
    };

    //endregion methods

  };
  return vm;
}); //define