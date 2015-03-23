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
        { moduleId: 'transforMap/home',			route: ['', 'home', 'start'],							title: ''			}
      , { moduleId: 'discover',					route: ['map'],											title: 'Map' }
      , { moduleId: 'siteCollector',			route: ['add', 'edit/:id'],								title: 'New'		}

      , { moduleId: 'my/login',					route: ['my/login'],									title: 'Login'      }
      , { moduleId: 'my/registration',			route: ['my/registration'],								title: 'Register'   }
      , { moduleId: 'my/registrationExt',		route: ['my/registrationExt'],							title: 'Register'   }
      , { moduleId: 'my/profile',				route: ['my/profile++'],								title: 'Profile'    }

      //, { moduleId: 'about/onyourway',        route: ['about/onyourway++', 'ueber/onyourway++'],		title: 'Über'       }
      //, { moduleId: 'about/privacy',          route: ['about/privacy', 'ueber/privatsphaere'],		title: 'Privatsphäre' }
      , { moduleId: 'transforMap/impress', route: ['about', 'impress'], title: 'About' }

      , { moduleId: 'about/_preview',			route: ['about/preview', 'ueber/demo'],					title: 'Preview'	}
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
      .mapUnknownRoutes('discover', 'UNKNOWN') //TODO: 'not found' -> create error message
      .activate('discover')
    ;
  }

  //function onBind() {
  //  //tell.log('map initialized', 'shell', $('#map').html())
  //}

  //#endregion Internal Methods

});