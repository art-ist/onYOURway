/*
Theme:
	vonMorgen
URLs: (set in Views/Home/Index.cshtml)
	kartevonmorgen.org
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
  	durandal.title = "TransforMap";

  	app.location.settings.showMap(true);
  	app.location.settings.showList(false);
  	app.location.settings.showDetails(false);
  	app.location.settings.forceMap = true;
  	app.location.settings.showVeilOfSilence = false;
  	app.location.settings.disableDetails = true;

    var routes = [
        { moduleId: 'transforMap/home',			route: ['', 'home', 'start'],							title: ''               }
      , { moduleId: 'siteCollector',			route: ['add', 'edit/:id'],								title: 'Neuer Eintrag'  }

      , { moduleId: 'my/login',					route: ['my/login'],									title: 'Anmelden'       }
      , { moduleId: 'my/registration',			route: ['my/registration'],								title: 'Registrieren'   }
      , { moduleId: 'my/registrationExt',		route: ['my/registrationExt'],							title: 'Registrieren'   }
      , { moduleId: 'my/profile',				route: ['my/profile++'],								title: 'Profil'         }

      //, { moduleId: 'about/onyourway',        route: ['about/onyourway++', 'ueber/onyourway++'],		title: 'Über'           }
      //, { moduleId: 'about/privacy',          route: ['about/privacy', 'ueber/privatsphaere'],		title: 'Privatsphäre'   }
      , { moduleId: 'transforMap/impress', route: ['about', 'impress'], title: 'About' }

      , { moduleId: 'about/_preview',			route: ['about/preview', 'ueber/demo'],					title: 'Public Preview' }
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
      .mapUnknownRoutes('home', 'UNKNOWN') //TODO: 'not found' -> create error message
      .activate('home')
    ;
  }

  //function onBind() {
  //  //tell.log('map initialized', 'shell', $('#map').html())
  //}

  //#endregion Internal Methods

});