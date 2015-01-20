﻿require.config({
  paths: {
    'text'        : './_libraries/text',
    'durandal'    : './_libraries/durandal',
    'plugins'     : './_libraries/durandal/plugins',
    'transitions' : './_libraries/durandal/transitions',
    'knockout'    : './_libraries/knockout-3.2.0',
    'jquery'      : './_libraries/jquery-2.0.1',
    'bootstrap'   : './_libraries/bootstrap',
    'services'    : './services',
    'providers'   : './services/providers'
  },
 // urlArgs: "bust=" + (new Date()).getTime(),  //bust cacheFontAwesome
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
  'plugins/router',
  'services/logger',
  'services/tell'
], function (system, durandal, viewLocator, router, logger, tell) {

    window.onerror = function globalErrorHandler(msg, file, line) {
        logger.error(msg, file + ': ' + line);
    }
    logger.traceLevel = 2;
    tell.traceLevel = 7;

    registerBootstrapReplacements();

    durandal.configurePlugins({
        router: true,
        dialog: true
    });

    ko.components.register('searchBox', { require: 'components/searchBox-component' });

    durandal.start().then(function () {
      viewLocator.useConvention('views', 'views', 'views');
      router.makeRelative({ moduleId: 'views' });
      startShell();
    });

    function startShell() {
    	var shell = 'themes/' + window.theme + '/shell';
        durandal.setRoot(shell, { entrance: 'entranceLeft' });
    }

    function registerBootstrapReplacements() {
        //make bootstrap accordeon work without bootstrap
        $(document).on('click.bs.collapse.data-api','[data-toggle=collapse]',function(){$(this.dataset.parent).find('.panel-collapse').toggle('in');return false;});
    }

  });
