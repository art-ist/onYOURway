/// <reference path="../../../Scripts/q.js" />
define([
  'services/logger',
  'services/app',
  'plugins/router'
],
  function (logger, app, router) {

    var vm = {
      app: app
      , title: 'Entdecker'

      //activate: function () {
      //  logger.log('View activated', self.title);

      //  return true;
      //},

      , currentArticle: ko.observable('#header')
      , activate: function (article) {
        if (article) { self.currentArticle('#' + article); }
        return;
      }
      , attached: function () {
        app.navigateInPage(function afterNavigate(href, target) {
          self.currentArticle(href);
        });
      }
      , compositionComplete: function () {
        var target = $(self.currentArticle());
        if (target) $('.oyw-content-main').scrollTo(target, { offset: 0, duration: app.settings.animationDuration });
        $('.oyw-content-nav a[href="' + self.currentArticle() + '"]').parent('li').addClass('active');
        return true;
      }

      , startTourSuche: function () {
        intro.start(); //TODO: bring to front (maybe simply put at the end instead of the beginnig of the document?)
      }

    };
    var self = vm;

    var intro = introJs();
    intro
      .setOptions({
        steps: [
          {
            element:  '#searchFor',
            intro:    "Finden Sie einfach und schnell Anbieter und andere Standorte in Ihrer Region.<br/>"
                      + "Suchen Sie nach Namen, Straße, oder auch Kategorien oder einfach nach Kriterien wie 'Heuriger', 'Obst' oder 'Fair gehandelt'.",
            position: 'bottom'
          }
          ,{
            element: '#startSearchBtn',
            intro:    "Mit dieser Schaltfläche können die Suche starten. Oder Sie drücken in der Suchebox ein zweites Mal die Eingabetaste.",
            position: 'bottom'
          }
          ,{
            element: '#locationList',
            intro: 'Hier und in der Karte werden die Treffer angezeigt. Wählen Sie einen Listeneintrag oder eine Stecknadel in der Karte, um einen Anbieter auszuwählen. Klicken Sie nocheinmal um die Details anzuzeigen.',
            position: 'left'
          }
          //,{
          //  element: '#138',
          //  intro:    'Wählen Sie einen Listeneintrag oder eine Stecknadel in der Karte, um einen Anbieter auszuwählen. Klicken Sie nocheinmal um die Details anzuzeigen.',
          //  position: 'left'
          //}
          , {
            element:  '#toggleAdvancedSearchBtn',
            intro:    'Um Ihre Auswahl zu verfeinern zeigen Sie die erweiterten Suchoptionen an.',
            position: 'bottom'
          }
          ,{
            element:  '#search-adv',
            intro:    'Hier können Sie in der Nähe Ihrer aktuellen Position oder eines anderen Ortes suchen. Sie können Sich aber auch anzeigen lassen welche Angeboe es entlang Ihres Weges gibt. Wählen Sie wann Sie Ihre Besorgungen machen wollen und die Geschäfte werden angezeigt, die dann offen haben. Und Sie können selbst entscheiden, nach welchen Kriterien Anbieter hervorgehoben werden.',
            position: 'bottom'
          }
          ,{
            element:  '#menu-view',
            intro:    'Hier können Sie den Kartenausschnitt verändern (zoomen) oder einen anderen Kartenstil wählen.',
            position: 'bottom'
          }
        ]
      })
      .onbeforechange(function (target) {
        switch (target.id) {
          case 'toggleAdvancedSearchBtn':
            app.tools.search(true);
            break;
          case 'startSearchBtn':
            $('#searchFor').val('bi');
            app.location.search('bi');
            break;
          //case '138':
          //  app.location.selectedItem(app.location.mapLocations()[12]);
          //  break;
          case 'menu-view':
            app.tools.search(false);
            break;
        } //switch
      })
      .oncomplete(function () {
        router.navigate('#/about/explorer')
      })
    ;

    return vm;
  }); //define