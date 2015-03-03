/* setup and copy this file to app.config.js or get the Contributors Toolkit */
var config = {

	appName: 'onYOURway (preview)',

	host: 'http://localhost:42102',
	//host: 'http://onyourway.at',
	//host: 'http://onyourway.azurewebsites.net',

	realm: '', //undefined, null, '' or any other false-isch value means autodetect from app-url

	region: '', //

	apiKeys: {
		cloudmade: 'YOUR CLOUDMADE API KEY HERE',
		lyrk: 'YOUR lyrk.org API KEY HERE',
		bing: 'YOUR bing.com API KEY HERE'
	},

	serviceEmail: 'web@onyourway.at',	//Change if running your own app instance

	features: {
		shoppingList: false,			//shoppingList feature available?
	},

	traceLevel: 2,				// log errors only (see tell.js)
	//traceLevel: 7,					// log debug messages (see tell.js)

}