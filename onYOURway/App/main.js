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
  },
  urlArgs: "bust=" + (new Date()).getTime(),  //bust cacheFontAwesome
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
  'services/logger'
],
  function (system, durandal, viewLocator, router, app, platform, logger) {

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
      logger.error(msg, file + ': ' + line);
    }

    //>>excludeStart("build", true);
    logger.traceLevel = 2;                 // Enable logging to output to console
    system.debug(logger.traceLevel > 1);   // Enable durandal debug messages to show in the console 
    //>>excludeEnd("build");

    if (window.PhoneGap) {
      logger.log('running on PhoneGap', 'main');
      document.addEventListener("deviceready", onDeviceReady, false);
    } else {
      //$(document).ready(function () {
      logger.log('running in Browser', 'main');
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
        durandal.title = "onYOURway";

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
          logger.logError('No Route Found', 'main', route);
        };

        //Look for viewmodels, views and partial views in the views folder
        viewLocator.useConvention('views', 'views', 'views');
        router.makeRelative({ moduleId: 'views' });

        // Adapt to touch devices
        //durandal.adaptToDevice();

        //Show the app by setting the root view model for our application.
        startShell();
        app.initialize();

      }); //durandal.start().then
    } //_onDeviceReady

    function startShell() {
    	var shell = 'themes/' + window.theme + '/shell';
    	switch (platform.device.type) { //choose shell depending on environment
    		case 'Phone':
    			logger.log('starting Phone shell', 'main');
    			durandal.setRoot(shell, 'entranceLeft'); //TODO: expected to set the default transition
    			break;
    			//case 'Tablet':
    			//case 'PC':
    		default:
    			logger.log('starting default shell on device type: ' + platform.device.type, 'main');
    			durandal.setRoot(shell, { entrance: 'entranceLeft'/*, fadeOnly: true*/ }); //TODO: expected to set the default transition
    			break;
    	} //switch (platform.device.type)
    }

  }); //define

