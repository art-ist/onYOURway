﻿/*
Theme:
	vonMorgen
URLs: (set in Views/Home/Index.cshtml)
	kartevonmorgen.org
*/

define([
  'plugins/router',
  'durandal/app'
], function (router, durandal) {
  return {
    router: router,
    activate: onActivate
  };

  function onActivate() {
  	durandal.title = "Karte von Morgen";

    router.map([
      { moduleId: 'vonMorgenMin/home',         route: ['', 'home', 'start'],                           title: ''               },
      { moduleId: 'vonMorgenMin/onlyMap',      route: ['map', 'karte'],                                title: ''               },
      { moduleId: 'my/siteCollector',          route: ['add', 'neu'],                                  title: ''               }
    ]);

    return router.mapUnknownRoutes('vonMorgenMin/home', 'UNBEKANNT').activate('vonMorgenMin/home');
  }

});
