/// <reference path="../../Scripts/require.js" />
/// <reference path="../durandal/plugins/router.js" />
/// <reference path="../services/logger.js" />
/// <reference path="../services/app.js" />

define([
  'plugins/router',
  'services/app',
  'services/logger'
], function (router, app, logger) {
  var shell = {
    router: router,
    app: app,

    activate: onActivate
    //,bind: onBind
  };
  return shell;

  //#region Internal Methods

  function onActivate() {
    var routes = [
        { moduleId: 'home',                   route: ['', 'home', 'start'],                           title: ''               }
      , { moduleId: 'regions',                route: ['regions', 'regionen'],                         title: 'Regionen'       }
      , { moduleId: 'discover',               route: ['map', 'karte', 'discover', 'erkunden'],        title: 'Erkunden'       }
      , { moduleId: 'search',                 route: ['search', 'suche'],                             title: 'Suchen'         }

      , { moduleId: 'my/login',               route: ['my/login'],                                    title: 'Anmelden'       }
      , { moduleId: 'my/registration',        route: ['my/registration'],                             title: 'Registrieren'   }
      , { moduleId: 'my/registrationExt',     route: ['my/registrationExt'],                          title: 'Registrieren'   }
      , { moduleId: 'my/profile',             route: ['my/profile++'],                                title: 'Profil'         }
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
    logger.log('routes set', '_shell', routes);
    return router
      //.buildNavigationModel()
      .mapUnknownRoutes('home', 'UNBEKANNT') //TODO: 'not found' -> create error message
      .activate('home')
    ;
  }

  //function onBind() {
  //  //logger.log('map initialized', 'shell', $('#map').html())
  //}

  //#endregion Internal Methods

});