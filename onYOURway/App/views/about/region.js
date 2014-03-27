define([
  'services/logger',
  'services/app'
],
  function (logger, app) {

    var self = {
      app: app,
      title: 'Region',

      email: 'info[at]onYOURway[dot]at'.replace('[at]', '@').replace('[dot]', '.'),
      emailUrn: 'mehlto:'.replace('mehl', 'mail') + 'info[at]onYOURway[dot]at'.replace('[at]', '@').replace('[dot]', '.'),

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
    return self;

  }); //define