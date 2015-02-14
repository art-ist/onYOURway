require.config({
    paths: {
        'text'			: '../App/_libraries/text',
        'durandal'		: '../App/_libraries/durandal',
        'plugins'		: '../App/_libraries/durandal/plugins',
        'transitions'	: '../App/_libraries/durandal/transitions',
        'knockout'		: '../App/_libraries/knockout-3.2.0',
        'jquery'		: '../App/_libraries/jquery-2.0.1',
        'bootstrap'		: '../App/_libraries/bootstrap',
        'squire'		: '../App/_libraries/squire',
        'services'		: '../App/services',
        'providers'		: '../App/services/providers',
        'components'	: '../App/components'
    },
    //urlArgs: "bust=" + (new Date()).getTime(),  //bust cache
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

//Tests
define([
	//'App/components/searchBox-componentTest',
	'Api/Account/identityTests',
	'Api/Locate/locationBoundariesTests'
],
function () { });
