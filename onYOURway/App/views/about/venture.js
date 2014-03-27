define([
  'services/logger',
  'services/app'
],
  function (logger, app) {

    var vm = {
      app: app,
      title: 'Anbieter',

      //activate: function () {
      //  logger.log('View activated', self.title);

      //  return true;
      //},

      currentArticle: ko.observable('#header'),
      activate: function (article) {
        if (article) {
          self.currentArticle('#' + article);
        }
        return;
      },
      attached: function () {
        app.navigateInPage(function afterNavigate(href, target) {
          self.currentArticle(href);
        });
      },
      compositionComplete: function () {
        var target = $(self.currentArticle());
        if (target) $('.oyw-content-main').scrollTo(target, { offset: 0, duration: app.settings.animationDuration });
        $('.oyw-content-nav a[href="' + self.currentArticle() + '"]').parent('li').addClass('active');
        return true;
      }

    };
    var self = vm;
    return vm;

  }); //define