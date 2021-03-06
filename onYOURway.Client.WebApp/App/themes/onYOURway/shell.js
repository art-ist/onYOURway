﻿/*
Theme:
	onYOURway 2.1
URLs: (set in Views/Home/Index.cshtml)
	onYOURway.at, onYOURway.de, onYOURway.in
*/

define([
  'plugins/router',
  'durandal/app',
  'services/app',
  'services/tell'
], function (router, durandal, app, tell) {
  var shell = {
    router: router,
    app: app,

    activate: onActivate
    //,bind: onBind
  };
  return shell;

  //#region Internal Methods

  function onActivate() {
  	durandal.title = "onYOURway";

	//put app.location.settings here

    var routes = [
        { moduleId: 'home',                   route: ['', 'home', 'start'],                           title: ''               }
      , { moduleId: 'regions',                route: ['regions', 'regionen'],                         title: 'Regionen'       }
      , { moduleId: 'discover',               route: ['map', 'karte', 'discover', 'erkunden'],        title: 'Erkunden'       }
      , { moduleId: 'search',                 route: ['search', 'suche'],                             title: 'Suchen'         }
      , { moduleId: 'siteCollector',       route: ['siteCollector', 'siteCollector', 'add'],    title: 'Neuer Eintrag'  }

      , { moduleId: 'my/login',               route: ['my/login'],                                    title: 'Anmelden'       }
      , { moduleId: 'my/registration',        route: ['my/registration'],                             title: 'Registrieren'   }
      , { moduleId: 'my/registrationExt',     route: ['my/registrationExt'],                          title: 'Registrieren'   }
      , { moduleId: 'my/profile',             route: ['my/profile++'],                                title: 'Profil'         }
      , { moduleId: 'my/wizardNew',           route: ['my/wizardNew++'],                              title: 'Neuer Eintrag'  }
      , { moduleId: 'my/shoppingList',        route: ['my/shoppingList'],                             title: 'Einkaufsliste'  }

      , { moduleId: 'about/explorer',         route: ['about/explorer++', 'ueber/entdecker++'],       title: 'Entdecker'      }
      , { moduleId: 'about/venture',          route: ['about/venture++', 'ueber/anbieter++'],         title: 'Anbieter'       }
      , { moduleId: 'about/region',           route: ['about/region++', 'ueber/regionen++'],          title: 'Region'         }

      , { moduleId: 'about/onyourway',        route: ['about/onyourway++', 'ueber/onyourway++'],      title: 'Über'           }
      , { moduleId: 'about/privacy',          route: ['about/privacy', 'ueber/privatsphaere'],        title: 'Privatsphäre'   }
      , { moduleId: 'about/impress',          route: ['about/impress', 'ueber/impressum'],            title: 'Impressum'      }

      , { moduleId: 'about/_preview',         route: ['about/preview', 'ueber/demo'],                 title: 'Public Preview' }
    ];
    //add parameters to route with ++
    for (var i = 0; i < routes.length; i++) {
      for (var r = 0; r < routes[i].route.length; r++) {
        routes[i].route[r] = routes[i].route[r].replace("++",'(/:article)(/:sub)');
      }
    }
    router.map(routes);
    tell.log('routes set', '_shell', routes);
    return router
      //.buildNavigationModel()
      .mapUnknownRoutes('home', 'UNBEKANNT') //TODO: 'not found' -> create error message
      .activate('home')
    ;
  }

  //function onBind() {
  //  //tell.log('map initialized', 'shell', $('#map').html())
  //}

  //#endregion Internal Methods

});