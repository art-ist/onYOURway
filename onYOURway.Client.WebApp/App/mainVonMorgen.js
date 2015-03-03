require.config({
  paths: {
    'text'        : './_libraries/text',
    'durandal'    : './_libraries/durandal',
    'plugins'     : './_libraries/durandal/plugins',
    'transitions' : './_libraries/durandal/transitions',
    'knockout'    : './_libraries/knockout-3.0.0',
    'jquery'      : './_libraries/jquery-2.0.1',
    'bootstrap'   : './_libraries/bootstrap',
    'services'    : './services',
    'providers'   : './services/providers'

    , urlArgs: "bust=" + (new Date()).getTime()
  },
  shim: {
    'bootstrap': {
      deps: ['jquery'],
      exports: 'jQuery'
    }
  }
});

//Durandal 2: http://durandaljs.com/documentation/Conversion-Guide/
define('jquery', function () { return jQuery; });
define('knockout', ko);

define([
  'durandal/system',
  'durandal/app',
  'durandal/viewLocator',
  'plugins/router',   //Achtung Aufruf über durandal/plugins/router löst wegen nicht eindeutigem pfad timeout fehler aus

  'services/app',
  'services/platform',
  'services/tell'
],
  function (system, durandal, viewLocator, router, app, platform, tell) {

    //specify which plugins to install and their configuration
    durandal.configurePlugins({
        router: true
      , dialog: true
      //, observable: true
      //, widget: true
      //, widget: {
      //    kinds: ['expander']
      //  }
    });

    window.onerror = function globalErrorHandler(msg, file, line) {
      tell.error(msg, file + ': ' + line);
    }

    //>>excludeStart("build", true);
    tell.traceLevel = traceLevel			// Enable logging to output to console
    system.debug(tell.traceLevel > 1);		// Enable durandal debug messages to show in the console 
    //>>excludeEnd("build");

    if (window.PhoneGap) {
      tell.log('running on PhoneGap', 'main');
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      //$(document).ready(function () {
      tell.log('running in Browser', 'main');
      onDeviceReady(); //trigger onDeviceReady manually
      //});
    } //if (window.PhoneGap)

    function onDeviceReady() {
      if (window.PhoneGap) {
        //Cordova lifecycle events: http://cordova.apache.org/docs/en/2.5.0/cordova_events_events.md.html
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);
      }

      //START
      durandal.start().then(function () {
        durandal.title = "Karte von Morgen";

        //configure toastr (see: http://codeseven.github.io/toastr/demo.html)
        toastr.options.positionClass = 'toast-top-left';
        toastr.options.backgroundpositionClass = 'toast-top-left';
        toastr.options.iconClasses = {
          error: 'alert alert-danger',
          info: 'alert alert-info',
          success: 'alert alert-success',
          warning: 'alert alert-warning'
        };

        router.handleInvalidRoute = function (route, params) {
          tell.logError('No Route Found', 'main', route);
        };

        //Look for viewmodels, views and partial views in the views folder
        viewLocator.useConvention('views', 'views', 'views');
        router.makeRelative({ moduleId: 'views' });

        // Adapt to touch devices
        //durandal.adaptToDevice();

        //Show the app by setting the root view model for our application.
        //choose shell depending on environment
        switch (platform.device.type) {
          case 'Phone':
            tell.log('starting Phone shell', 'main');
            durandal.setRoot('views/vonMorgen/_shell', 'entrance'); //TODO: expected to set the default transition
            break;
          //case 'Tablet':
          //case 'PC':
          default:
            tell.log('starting default shell on device type: ' + platform.device.type, 'main');
            durandal.setRoot('views/vonMorgen/_shell', 'entrance'); //TODO: expected to set the default transition
            break;
        } //switch (platform.device.type)

        app.location.settings.showMap(true);
        app.location.settings.showList(false);
        app.location.settings.showDetails(false);
        app.location.settings.forceMap = true;
        app.location.settings.disableDetails = true;

        app.initialize();

      }); //durandal.start().then
    } //_onDeviceReady

  }); //define

