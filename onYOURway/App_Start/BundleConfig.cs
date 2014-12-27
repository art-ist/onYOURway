using System;
using System.Web.Optimization;

namespace onYOURway {

	/// <summary>
	/// Handles js and css (static) includes for the Home View (rendered to index.html)
	/// </summary>
	public class BundleConfig {

		/// <summary>
		/// Defines bundles of includes that can be used in Razor views.
		/// </summary>
		/// <param name="bundles">List of registered bundles</param>
		public static void RegisterBundles(BundleCollection bundles) {
			// For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
			bundles.IgnoreList.Clear();
			AddDefaultIgnorePatterns(bundles.IgnoreList);

			#region Script Bundles
			//~/bundles/scripts
			bundles.Add(new ScriptBundle("~/scripts")
				.Include(
				/*debugging tools - DISABLE FOR PRODUCTION*/
				//"~/App/_libraries/_test/IE.CompatInspector.js",             //check for compatibility issues (see: http://ie.microsoft.com/testdrive/HTML5/CompatInspector/help/post.htm)

				  /*config*/
					 "~/App/app.config.js"                                   // client config file

				  /*framework*/
				   , "~/App/_libraries/jquery-{version}.js"                  // the js toolbelt
				   , "~/App/_libraries/knockout-{version}.js"                // mvvm, databinding
				   , "~/App/_libraries/q.js"                                 // 
				   , "~/App/_libraries/bootstrap.js"                         // Bootstrap 3 JavaScript Features (BEWARE: builtin menus may stop to work)

				   , "~/App/_libraries/knockout.mapping-{version}.js"        // ko.mapping plugin (ko.mapping.fromJS)
				   , "~/App/_libraries/knockout.validation.debug.js"         // input validation
				   , "~/App/_libraries/toastr.js"                            // TODO: integrate into logger and integrate logger as durandal plugin
				   , "~/App/_libraries/breeze.debug.js"                      // serverside datastorage using e.g. WebAPI & EF
				   , "~/App/_libraries/breeze.saveErrorExtensions.js"        // analyze breeze errormessages
				//, "~/App/_libraries/lawnchair-{version}.js"             // local storage

				   /*polyfills*/
				   , "~/App/_libraries/modernizr-{version}.js"               // detect browser capabilities (see: http://modernizr.com)
				//, "~/App/_libraries/respond.js"                         // mit modernizr nicht nötig?

				   /*tools*/
				   , "~/App/_libraries/jquery.scrollTo-{version}.js"         // helper to scroll elements (see: http://flesler.blogspot.co.at/2007/10/jqueryscrollto.html)
				   , "~/App/_libraries/jquery.localscroll-{version}.js"      // helper to scroll elements, requires scrollTo (see: http://flesler.blogspot.co.at/2007/10/jquerylocalscroll-10.html)
				   , "~/App/_libraries/jquery.scrollIntoView.js"             // helper to scroll elements into view (see: https://github.com/pegler/jQuery.scrollIntoView)    
				   , "~/App/_libraries/moment-with-langs.js"                 // better javascript support for Date (including localization)
				   , "~/App/_libraries/suncalc.js"                           // calculates sun and moon position (requirement for opening_hours (there is an OSM tag for sunrise and sunset))
				   , "~/App/_libraries/opening_hours.js"                     // parser for openingHours (OSM compliant, see: https://github.com/ypid/opening_hours.js)

				   /*map*/
				   , "~/App/_libraries/leaflet/leaflet-{version}.js"         // map-control
				   , "~/App/_libraries/leaflet/javascript.util.js"           // helper for java-ports like jsts
				   , "~/App/_libraries/leaflet/jsts.js"                      // JavaScript Topology Suite (js-Port of JTS - geography library)
				   , "~/App/_libraries/leaflet/leaflet.awesome-markers.js"   // easy markers
				   , "~/App/_libraries/leaflet/leaflet.markercluster-src.js" // cluster nearby markers
				   , "~/App/_libraries/leaflet/leaflet.overpass-layer.js"    // dirctly display results (nodes only) of overpass-osm queries
				   , "~/App/_libraries/leaflet/leaflet.draw.js"			   // map features, see: https://github.com/Leaflet/Leaflet.draw

				   /*components*/
				   , "~/App/_libraries/jquery-ui-{version}.custom.js"        // jQueryUI (using slider)
				   , "~/App/_libraries/bootstrap-datepicker.js"              // Datepicker
				   , "~/App/_libraries/locales/bootstrap-datepicker.de.js"   // Datepicker German languagepack
				   , "~/App/_libraries/bootstrap-typeahead.js"               // Autocomplete (see: https://github.com/bassjobsen/Bootstrap-3-Typeahead)
				   , "~/App/_libraries/intro.js"                             // Help/Tour (see: https://github.com/usablica/intro.js)
				   , "~/App/_libraries/owl.carousel.js"                      // slideshow & wizard
				   , "~/App/_libraries/select2/select2.js"                   // select2 multiselect

				   /*bindinghandlers*/
				   , "~/App/_libraries/knockout-bootstrap.js"                // bindinghandlers for typeahead, progress, alert, tooltip, popover 
				)
				.IncludeDirectory("~/App/extensions", "*.js", false)
				.IncludeDirectory("~/App/bindingHandlers", "*.js", false)
			);
			bundles.Add(new ScriptBundle("~/App/_libraries/site")
				.Include(
					/* old Website viewmodels (REPLACE) */
					"~/App/_libraries/app/ajaxPrefilters.js"
				  , "~/App/_libraries/app/app.bindings.js"
				  , "~/App/_libraries/app/app.datamodel.js"
				  , "~/App/_libraries/app/app.viewmodel.js"
				  , "~/App/_libraries/app/home.viewmodel.js"
				  , "~/App/_libraries/app/login.viewmodel.js"
				  , "~/App/_libraries/app/register.viewmodel.js"
				  , "~/App/_libraries/app/registerExternal.viewmodel.js"
				  , "~/App/_libraries/app/manage.viewmodel.js"
				  , "~/App/_libraries/app/userInfo.viewmodel.js"
				  , "~/App/_libraries/app/_run.js"
				)
			);
			#endregion Script Bundles

			#region Style Bundles
			//~/App/_styles/css
			bundles.Add(new StyleBundle("~/styles").Include(
				/*framework*/
				"~/App/_styles/ie10mobile.css"
			  , "~/App/_styles/durandal.css"  //TODO: replace with consistent bootstrap compliant messaging module
			  , "~/App/_styles/toastr.css"    //TODO: replace with consistent bootstrap compliant messaging module
				//, "~/App/_styles/bootstrap.css"   //moved to theme so theme designers can use a different flovour of bootstrap or BS themes
			  , "~/App/_styles/font-awesome.css"

			  /*map*/
			  , "~/App/_styles/leaflet/leaflet.css"
			  , "~/App/_styles/leaflet/leaflet.awesome-markers.css"
			  , "~/App/_styles/leaflet/MarkerCluster.css"
			  , "~/App/_styles/leaflet/MarkerCluster.Default.css"
			  , "~/App/_styles/leaflet/leaflet.draw"

			  /*components*/
			  , "~/App/_styles/bootstrap-datepicker.css"
			  , "~/App/_styles/typeahead.js-bootstrap.css"
			  , "~/App/_styles/introjs.css"
			  , "~/App/_styles/owl.carousel.css"
			  , "~/App/_styles/jquery-ui/jquery-ui-{version}.custom.css"        // jQueryUI (using slider)
			  , "~/App/_styles/owl.theme.css"
			  , "~/App/_styles/select2.css"                // select2 multiselect
			  , "~/App/_styles/select2-bootstrap.css"

				/*themes*/
			  , "~/App/themes/_shared.css" // css shared between all themes

			));

			#endregion Style Bundles

		} //RegisterBundles

		/// <summary>
		/// Defines which files to ignore when a bundle is defined to include a complete folder.
		/// </summary>
		/// <param name="ignoreList">List of file patterns to be ignored</param>
		public static void AddDefaultIgnorePatterns(IgnoreList ignoreList) {
			if (ignoreList == null) {
				throw new ArgumentNullException("ignoreList");
			}

			ignoreList.Ignore("*.intellisense.js");
			ignoreList.Ignore("*-vsdoc.js");

			//ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
			//ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
			//ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
		} //AddDefaultIgnorePatterns

	} //class BundleConfig
} //ns
