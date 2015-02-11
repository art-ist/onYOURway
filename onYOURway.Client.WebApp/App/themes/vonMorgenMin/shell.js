/*
Theme:
	vonMorgen
URLs: (set in Views/Home/Index.cshtml)
	kartevonmorgen.org
*/

define([
  'plugins/router',
  'durandal/app',
   'services/map/settings'
], function (router, durandal, settings) {
  return {
    router: router,
    activate: onActivate,
  };

  function onActivate() {
  	durandal.title = "Karte von Morgen";

    settings.defaultRegion(265);

    router.map([
      { moduleId: 'vonMorgenMin/home',               route: ['', 'home', 'start'],                         title: ''  },
      { moduleId: 'vonMorgenMin/onlyMap',            route: ['map', 'karte'],          hash: 'map',        title: 'Karte'  },
      { moduleId: 'vonMorgenMin/searchResults',      route: 'search(/:searchTerm)',                        title: 'Suche'  },
      { moduleId: 'my/siteCollector',                route: ['add', 'neu'],                                title: 'Neu'  }
    ]);

    return router.mapUnknownRoutes('vonMorgenMin/home', 'UNBEKANNT').activate('vonMorgenMin/home');
  }

});
