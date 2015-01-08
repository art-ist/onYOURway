///
/// inspector.js
/// Compat Inspector
/// Monitor a web application's interactions for known compatibility issues.
///
/// Public APIs (this file only)
/// - inspector.baseURL
/// - inspector.executeScript()
/// - inspector.frames[]
/// - inspector.forEach()
/// - inspector.loadScript()
/// - inspector.loadSource()
///
window.inspector = new function () {

	// Ensure pre-requisites are supported
	// For practical purposes, the combination of ES5 and DOM Events support is sufficient
	if (!Object.defineProperty || !window.addEventListener) {
		if (window == window.top) {
			if (window.addEventListener) window.addEventListener("load", notifyLoadFailed, false);
			else if (window.attachEvent) window.attachEvent("onload", notifyLoadFailed, false);
		}
		return;
	}

	function notifyLoadFailed() {
		var msg = "Compat Inspector: Pre-requisites are not supported."
			+ ((document.documentMode && document.documentMode < 9) ? " Ensure your page is running in IE9 Standards Mode or better." : "")
		;
		if (window.console) console.warn(msg);
		var elm = document.createElement("div");
		elm.style.position = "absolute";
		elm.style.top = 0;
		elm.style.right = 0;
		elm.style.zIndex = 9999999999;
		elm.style.color = "#fff";
		elm.style.backgroundColor = "#000";
		elm.style.fontFamily = "Segoe UI, sans-serif";
		elm.style.fontSize = "9pt";
		elm.style.width = "220px";
		elm.style.padding = "10px";
		elm.appendChild(document.createTextNode(msg));
		document.body.appendChild(elm);
	}

	// Keep a reference to the framework object inside our scope
	var inspector = this;

	//
	// PUBLIC APIs
	//

	inspector.config = null; // Framework configuration object
	inspector.baseURL = "";  // The root URL needed to load inspector files
	inspector.documentURL = document.location.href; // Cache a reference to the "true" URL of the document
	inspector.frames = []; // Track all frames in which inspector instances are loaded (if topmost instance)
	inspector.uiDocument = null; // A reference to the frame document containing the inspector UI
	inspector.uiElement = null; // A reference to the element containing the inspector UI frame
	inspector.source = {}; // Maintain a collection of sources for loaded libraries and modules
	inspector.top = (window == window.top); // Identify if this inspector instance is running in the topmost frame
	inspector.CORS = ('withCredentials' in XMLHttpRequest.prototype);

	/// Initialize the inspector by loading the configuration and tests
	inspector.init = function () {
		var inspectorScript = document.getElementsByTagName("script")[0];
		var inspectorURL = inspectorScript.getAttribute("src");

		var fShowInspectorUI = true;

		// Allow collaboration across frames
		window.addEventListener("message", handleMessage, false);

		if (!inspector.top) {
			// Hide the inspector UI in frames
			fShowInspectorUI = false;
			var msg = { module: "inspector", frame: inspector.documentURL };
			window.top.postMessage(inspector.stringifyJSON(msg), "*");
		}

		// Check to see if we should show the Inspector UI
		var fShowUI = inspectorScript.getAttribute("ShowUI");
		if ((null != fShowUI) && (fShowUI == "false")) {
			fShowInspectorUI = false;
		}

		inspector.baseURL = inspectorURL.substring(0, inspectorURL.length - "inspector.js".length);



		// Load configuration file (if needed)
		if (!inspector.config) inspector.config = inspector.loadJSON(inspector.baseURL + "config.txt");

		// Load and initialize the user interface
		initUI(inspectorScript);

		// Load and initialize core libraries
		initLibraries();

		// For now our testing is geared toward IE9 Standards Mode and newer
		// Notify the user about potentially missed issues if we're running somewhere else
		if (!document.documentMode || document.documentMode < 9) {
			inspector.info(
				"Running Compat Inspector in <b><i>IE9 or IE10 Standards Mode</i></b> is recommended due to "
				+ "the version-specific nature of the provided compatibility tests. Some issues may "
				+ "not be reported when running in other document modes or browsers since different "
				+ "code branches might be executed."
			);
		}

		// Attach UI (if needed)
		if (fShowInspectorUI) {
			inspector.hideFromListeners(function () {
				inspector.attachUI();
			});
		}

		// Hide Compat Inspector from the page if requested
		if (inspector.config.hide) delete window.inspector;
	}

	/// Execute the specified script within the inspector scope
	/// Usage: executeScript(String source);
	inspector.executeScript = function (source) {
		eval(source);
	}

	/// Extract and verify a message received via postMessage
	inspector.extractMessage = function (msg) {
		try {
			msg = inspector.parseJSON(msg);
		} catch (e) {
			msg = null;
		}
		return msg;
	}

	/// Apply the provided functor to each item in the specified array
	inspector.forEach = function (array, functor) {
		for (var i = 0; i < array.length; i++) {
			functor(array[i]);
		}
	}

	/// Synchronously load a JSON object from the specified URL
	inspector.loadJSON = function (url) {
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.send();
		return inspector.parseJSON(request.responseText);
	}

	/// Synchronously load and run a script from the specified URL
	/// The script will run in the global scope
	/// Usage: loadScript(String url);
	inspector.loadScript = function (url) {
		var source = inspector.loadSource(url);
		eval.call(window, source);
	}

	/// Synchronously load the source of the specified URL
	/// Usage: loadSource(String url);
	inspector.loadSource = function (url) {
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		request.send();
		return request.responseText;
	}

	inspector.parseJSON = function (str) {
		return JSON.parse(str);
	}

	inspector.stringifyJSON = function (obj) {
		return JSON.stringify(obj);
	}

	//
	// PRIVATE APIs
	//

	// Cache a reference to the native JSON object
	var JSON = window.JSON;

	function handleMessage(e) {
		var msg = inspector.extractMessage(e.data);
		if (msg && msg.module == "inspector" && msg.frame) {
			inspector.frames.push(e.source);
			inspector.syncSession(); // Synchronize state with newly added frames
		}
	}

	function initLibraries() {
		if (!inspector.libraries) loadLibraries();
		inspector.libraries(inspector, inspector.uiDocument);
	}

	function initUI(beforeElm) {
		var ui = inspector.uiElement = document.createElement("div");
		ui.style.display = "none";

		var iframe = document.createElement("iframe");
		iframe.setAttribute("frameborder", "0");
		iframe.style.width = "100%";
		iframe.style.height = "100%";

		ui.appendChild(iframe);
		document.documentElement.appendChild(ui);

		loadUI();

		var doc = inspector.uiDocument = iframe.contentDocument;
		doc.open();
		doc.write(inspector.source.ui);
		doc.close();
	}

	function loadLibraries() {
		var source = "";
		var libraries = inspector.config.libraries;
		for (var i = 0; i < libraries.length; i++) {
			source += inspector.loadSource(inspector.baseURL + "lib/" + libraries[i]) + "\n";
		}
		inspector.source.libraries = source;
		inspector.libraries = eval("(function(inspector, document){" + inspector.source.libraries + "});");
	}

	function loadUI() {
		if (inspector.source.ui) return;
		var source = "<!DOCTYPE html><html><head><title>UI</title><base target='_blank'/></head><body>\n";
		var ui = inspector.config.ui;
		for (var i = 0; i < ui.length; i++) {
			source += inspector.loadSource(inspector.baseURL + "lib/" + ui[i]) + "\n";
		}
		source += "</body></html>";
		inspector.source.ui = source;
	}

	function log(msg) {
		if (window.console) console.log(msg);
	}

}

inspector.config = { "hide": true };

inspector.libraries = (function (inspector, document) {
	/// session.js
	/// Compat Inspector Session Management Library
	/// 
	/// Public APIs
	/// - inspector.syncSession()
	///
	/// Protected APIs
	/// - session

	var session;
	(function () {

		//
		// Public APIs
		//

		// Copy the current session to child frames
		inspector.syncSession = function () {
			if (!inspector.top) return; // Don't run unless we're the top-most inspector instance
			var message = { module: "session", session: session };
			var messageStr = inspector.stringifyJSON(message);
			for (var i = 0; i < inspector.frames.length; i++) {
				try {
					inspector.frames[i].postMessage(messageStr, "*");
				} catch (e) {
					// Handle frames that have been removed
					inspector.frames.splice(i, 1);
					i--;
				}
			}
		}

		//
		// Private APIs
		//

		// Load a previously saved session or create an empty session if no saved session exists
		function loadSession() {
			var sessionStr = window.sessionStorage.getItem("com.microsoft.compatinspector");
			if (!sessionStr) session = {};
			else session = inspector.parseJSON(sessionStr);
		}

		// Save the current session information
		function saveSession() {
			var sessionStr = inspector.stringifyJSON(session);
			window.sessionStorage.setItem("com.microsoft.compatinspector", sessionStr);
		}

		// Override the session of this frame with that of the topmost frame
		function overrideSession(e) {
			if (inspector.top) return;
			var msg = inspector.extractMessage(e.data);
			if (msg && msg.module == "session") {
				session = msg.session;
			}
		}

		// Load saved session
		loadSession();

		// Register to save session when the user leaves the page
		window.addEventListener("unload", saveSession, false);
		window.addEventListener("message", overrideSession, false);
	})();

	/// ui.js
	/// Compat Inspector User Interface Logic
	///
	/// Public APIs
	/// - inspector.attachUI()
	///
	/// Protected APIs
	/// - $()
	/// - $$()
	/// - ui.addStatusInfo()
	/// - ui.addDetailsTab()

	// Declare Protected APIs
	var $;
	var $$;
	var ui = {};

	// Create session object to save UI state
	if (!session.ui) session.ui = {};

	(function () {

		var ownerDocument;

		//
		// PUBLIC APIs
		//

		/// Attach the inspector UI to the host page
		inspector.attachUI = function () {
			var style = inspector.uiElement.style;
			style.display = "block";
			style.position = "fixed";
			style.zIndex = 9999999999;

			ownerDocument = inspector.uiElement.ownerDocument;

			showStatusArea();
		}

		//
		// PROTECTED APIs
		//

		/// Shorthand for accessing UI elements via querySelector
		$ = function (selector) {
			return document.querySelector(selector);
		}

		/// Shorthand for accessing UI elements via querySelectorAll
		$$ = function (selector) {
			return document.querySelectorAll(selector);
		}

		/// Add a node to the status area
		ui.addStatusInfo = function (node) {
			statusArea.appendChild(node);
		}

		/// Add a new details tab and content
		ui.addDetailsTab = function (name, content) {
			// Create and initialize the tab
			var tab = tabTemplate.cloneNode(true);
			tab.textContent = name;
			tab.onclick = toggleTab;
			tabRow.appendChild(tab);

			// Initialize the tab content
			content.className = "content";
			tabContent.appendChild(content);

			// If this is the first tab, focus it
			if (tabRow.childNodes.length == 1) toggleTab.call(tab);

			return tab;
		}

		ui.updateStatusSize = function () {
			if (statusArea.className == "show") {
				var style = inspector.uiElement.style;
				style.width = "100%";
				style.height = "100%";
				style.width = statusArea.offsetWidth + 2 + "px";
				style.height = statusArea.offsetHeight + 2 + "px";
			}
		}

		//
		// PRIVATE APIs
		//

		// Obtain UI References
		var inspectorUI = $("#inspectorUI");
		var backButton = $("#backButton");
		var detailsArea = $("#detailsArea");
		var statusArea = $("#statusArea");
		var tabContent = $("#tabContent");
		var tabRow = $("#tabRow");
		var tabTemplate = $(".tab");

		// Attach Event Listeners
		backButton.onclick = toggleDetailsArea;
		statusArea.onclick = toggleDetailsArea;

		function showDetailsArea() {
			statusArea.className = "";
			detailsArea.className = "show";

			ownerDocument.documentElement.style.overflow = "hidden";

			// Resize the UI element to frame the details area
			var style = inspector.uiElement.style;
			style.top = "0";
			style.left = "0";
			style.bottom = "0";
			style.right = "0";
			style.width = "auto";
			style.height = "auto";
		}

		function showStatusArea() {
			detailsArea.className = "";
			statusArea.className = "show";

			ownerDocument.documentElement.style.overflow = "auto";

			// Resize the UI element to frame the status area
			var style = inspector.uiElement.style;
			style.top = "0px";
			style.left = "auto";
			style.bottom = "auto";
			style.right = "0px";
			ui.updateStatusSize();
		}

		function toggleDetailsArea() {
			if (detailsArea.className == "") {
				showDetailsArea();
			} else {
				showStatusArea();
			}
			inspector.syncSession();
		}

		function toggleTab() {
			var tabs = tabRow.childNodes;
			for (var i = 0; i < tabs.length; i++) {
				tabs[i].className = "tab";
			}
			this.className = "active tab";

			var targets = tabContent.childNodes;
			for (var i = 0; i < targets.length; i++) {
				if (this === tabRow.childNodes[i]) {
					targets[i].className = "show content";
				} else {
					targets[i].className = "content";
				}
			}
		}

	})();

	/// logging.js
	/// Compat Inspector Message Logging Library
	/// 
	/// Public APIs
	/// - inspector.doBreak
	/// - inspector.error()
	/// - inspector.info()
	/// - inspector.warn()
	///
	/// Protected APIs
	/// - logging.debuggable
	/// - logging.messages
	/// - logging.addMessageListener()
	/// - logging.isEnabled()
	/// - logging.toggle()

	// Declare Protected APIs
	var logging = {};

	// Implementation
	(function () {

		/// Maintain a log of all generated messages.
		/// This is only populated for the topmost inspector instance.
		logging.messages = [];

		//
		// PUBLIC APIs
		//

		/// Emit an error message and optionally break in the debugger (on by default).
		/// Usage: inspector.error(String message, [optional] String fixName);
		inspector.error = function (message, fixName) {
			notifyListeners({ type: "error", text: message, fix: fixName, url: location.href, host: location.host });
		}

		/// Emit an informational message and optionally break in the debugger.
		/// Usage: inspector.info(String message);
		inspector.info = function (message, fixName) {
			notifyListeners({ type: "info", text: message, fix: fixName, url: location.href, host: location.host });
		}

		/// Emit a warning message and optionally break in the debugger.
		/// Usage: inspector.warn(String message, [optional] String fixName);
		inspector.warn = function (message, fixName) {
			notifyListeners({ type: "warn", text: message, fix: fixName, url: location.href, host: location.host });
		}

		/// Indicate if a message has forced a break condition.
		/// Currently this is only set in logging.js by 'notifyListeners'.
		/// It is consumed by objectmodel.js in 'inspectorFunction'.
		inspector.doBreak = false;

		//
		// PROTECTED APIs
		//

		/// Register a listener to be notified when new messages are published
		logging.addMessageListener = function (listener) {
			listeners.push(listener);
		}

		/// While this is true, logged messages are debuggable
		/// This is primarily toggled by objectmodel.js
		logging.debuggable = false;

		//
		// PRIVATE APIs
		//

		var listeners = [];
		if (!session.debug) session.debug = {};

		// Watch 'window.onmessage' for messages forwarded from subframes
		function handleMessage(e) {
			var msg = inspector.extractMessage(e.data);
			if (msg && msg.module == "logging") {
				notifyListeners(msg, true);
			}
		}

		function notifyListeners(message, external) {
			// Check if the message came from a subframe
			if (!external) {
				// If not, set the message's debuggability state
				message.debuggable = logging.debuggable;
				// And signal objectmodel.js to break into the debugger if requested
				if (session.debug[message.text] || session.debug[message.text + message.url]) {
					inspector.doBreak = true;
				}
			}
			// Check if we're in the topmost inspector instance
			if (!inspector.top) {
				// If not, forward the message to the topmost inspector instance
				message.module = "logging";
				window.top.postMessage(inspector.stringifyJSON(message), "*");
			} else {
				// Otherwise, add the message to our message list
				logging.messages.push(message);
				// And notify our listeners
				for (var i = 0; i < listeners.length; i++) {
					listeners[i](message);
				}
			}
		}

		// Register for cross-frame messages
		window.addEventListener("message", handleMessage, false);

	})();

	/// logging-ui.js
	/// Compat Inspector Message Logging User Interface Logic

	(function () {

		var COUNT_LIMIT = 10;

		var counts = $("#counts");
		var messageLog = $("#messageLog");
		var messageContainer = $("#messages");
		var messageDetails = $("#message-details");
		var debugToggle = $(".debug-toggle");
		var fixToggle = $(".fix-toggle");
		var duplicateCount = $(".duplicate-count");
		var detailsTab;

		var messages = {};
		var details = {};

		var counters = {
			error: $("#errorCountValue").firstChild,
			warn: $("#warnCountValue").firstChild,
			info: $("#infoCountValue").firstChild
		}

		var templates = {
			error: $(".error.message"),
			info: $(".info.message"),
			warn: $(".warn.message")
		}

		function isDebugEnabled(text, url) {
			var id = text + (url || "");
			return session.debug[id];
		}

		function isFixEnabled(text, url) {
			var id = text + (url || "");
			return session.fixes[id];
		}

		function toggleDebug(checkbox, text, url) {
			var id = text + (url || "");
			if (checkbox.checked) session.debug[id] = true;
			else delete session.debug[id];
			inspector.syncSession();
		}

		function toggleFix(checkbox, text, url) {
			var id = text + (url || "");
			if (checkbox.checked) session.fixes[id] = true;
			else delete session.fixes[id];
			inspector.syncSession();
		}

		function addDebugToggle(msgElm, messageText, url) {
			var debugElm = debugToggle.cloneNode(true);
			var checkbox = debugElm.querySelector("input[type='checkbox']");
			checkbox.checked = isDebugEnabled(messageText, url);
			debugElm.onclick = function (e) { toggleDebug(checkbox, messageText, url) };
			msgElm.insertBefore(debugElm, msgElm.firstChild);
		}

		function addDuplicateCounter(msgElm) {
			msgElm.insertBefore(duplicateCount.cloneNode(true), msgElm.firstChild);
		}

		function addFixToggle(msgElm, fixName, url) {
			var fixElm = fixToggle.cloneNode(true);
			fixElm.title += "'" + fixName + "'";
			var checkbox = fixElm.querySelector("input[type='checkbox']");
			checkbox.checked = isFixEnabled(fixName, url);
			fixElm.onclick = function (e) { toggleFix(checkbox, fixName, url) };
			msgElm.insertBefore(fixElm, msgElm.firstChild);
		}

		function clearDetails() {
			messageDetails.innerHTML = "";
			details = {};
		}

		function clone(message) {
			var msg = {};
			for (prop in message) msg[prop] = message[prop];
			return msg;
		}

		// Process an incoming message notification from logging.js
		function handleMessage(message) {
			var counter = counters[message.type];
			var msg = clone(message);
			delete msg.url; // Prevent url filtering at the top level
			processMessage(messages, messageContainer, msg, counter);
		}

		function incrementDuplicateCounter(msg) {
			// Throttle to 10 entries for performance.
			var countElm = msg.firstChild;
			var count = parseInt(countElm.getAttribute("data-value")) + 1;
			if (count <= COUNT_LIMIT) {
				countElm.textContent = (count == COUNT_LIMIT) ? (count - 1) + "+" : count;
				countElm.setAttribute("data-value", count);
			}
		}

		function incrementStatusCounter(counter) {
			if (counter) {
				counter.nodeValue = parseInt(counter.nodeValue) + 1;
				ui.updateStatusSize();
			}
		}

		var prevented = "a input label".split(" ");
		function canClick(elm) {
			while (elm) {
				if (prevented.indexOf(elm.localName) != -1) return false;
				elm = elm.parentNode;
			}
			return true;
		}

		function processMessage(messages, messageContainer, message, counter) {
			inspector.hideFromListeners(function () {
				// Check to see if this message already exists
				var baseMsgElm = messages[message.text];
				if (!baseMsgElm) {
					// If not, render a new message
					var msg = renderMessage(message);

					// Then add the message to its collection and container
					messages[message.text] = msg;
					messageContainer.appendChild(msg);

					// Register a click listener to display details if this is top-level
					if (!message.url) {
						msg.onclick = function (e) { if (canClick(e.target)) showMessageDetails(message.text) };
					}

					// And increment the status counter for this message type
					incrementStatusCounter(counter);
				} else {
					// Otherwise, increment the duplicate counter.
					incrementDuplicateCounter(baseMsgElm);
				}
			});
		}

		function renderMessage(message) {
			// Get the appropriate template
			var template = templates[message.type];
			if (!template) throw "Unrecognized Message Type: '" + message.type + "'";

			// Create the message and set its text
			var msg = template.cloneNode(true);
			msg.innerHTML += message.text;

			// Add toggles and duplicate counter
			if (message.fix) addFixToggle(msg, message.fix, message.url);
			if (message.debuggable) addDebugToggle(msg, message.text, message.url);
			addDuplicateCounter(msg);

			return msg;
		}

		function showFrameInfo(message) {
			var msg = clone(message);
			msg.text = msg.host + "<p>" + msg.url + "</p>";
			msg.type = 'info';
			processMessage(details, messageDetails, msg);
		}

		function showMessageDetails(text) {
			var first = true;
			clearDetails();
			logging.messages.forEach(function (message) {
				// Filter on messages matching the provided text
				if (text == message.text) {
					if (first) {
						showTargetMessage(message);
						first = false;
					}
					showFrameInfo(message);
				}
			});
			detailsTab.click();
		}

		function showTargetMessage(message) {
			// Render the target message
			var msg = clone(message);
			msg.fix = null;
			msg.debuggable = null;
			processMessage(details, messageDetails, msg);

			// Render the sub-header for the frame list
			var header = document.createElement("h1");
			header.innerText = "Frames";
			messageDetails.appendChild(header);
		}

		function init() {
			logging.addMessageListener(handleMessage);
			ui.addStatusInfo(counts);
			ui.addDetailsTab("Messages", messageLog);
			detailsTab = ui.addDetailsTab("Details", $("#details-container"));
		}

		init();

	})();

	/// objectmodel.js
	/// Compat Inspector Helper APIs for Object Model Inspection
	/// 
	/// Public APIs
	/// - inspector.createStorageDescriptor()
	/// - inspector.hideFromListeners()
	/// - inspector.postCall()
	/// - inspector.postGet()
	/// - inspector.postSet()
	/// - inspector.preCall()
	/// - inspector.preGet()
	/// - inspector.preSet()
	/// - inspector.UNDEFINED

	(function (undefined) {

		var nPaused = 0;

		//
		// PUBLIC APIs
		//

		/// Object used by API listeners to override the return value with 'undefined'
		/// Usage: return inspector.UNDEFINED
		inspector.UNDEFINED = {};

		/// Create a basic descriptor which acts like a data property
		/// Usage: createStorageDescriptor(Object initialValue)
		inspector.createStorageDescriptor = function (data) {
			return {
				configurable: true,
				get: function () { return data; },
				set: function (value) { data = value; }
			}
		}

		/// Execute code that will be hidden from any active listeners
		/// This enables the use wrapped APIs without being tracked
		/// Usage: hideFromListeners(Function fn)
		inspector.hideFromListeners = function (fn) {
			nPaused++;

			// Use try/catch to defend against broken listeners
			try {
				fn();
			} catch (ex) {
				nPaused--;
				throw ex;
			}

			nPaused--;
		}

		/// Register a listener to be notified before the specified method has been called
		/// Usage: preCall(Object object, String methodName, Function listener);
		inspector.preCall = function (object, methodName, listener) {
			addBeforeListener(object, methodName, listener);
		}

		/// Register a listener to be notified before the specified property has been accessed
		/// Usage: preGet(Object object, String propertyName, Function listener);
		inspector.preGet = function (object, propertyName, listener) {
			var descriptor = getDescriptor(object, propertyName);
			if (typeof descriptor.set != "function") delete descriptor.set;
			addBeforeListener(descriptor, "get", listener);
			Object.defineProperty(object, propertyName, descriptor);
		}

		/// Register a listener to be notified before the specified property has been set
		/// Usage: preSet(Object object, String propertyName, Function listener);
		inspector.preSet = function (object, propertyName, listener) {
			var descriptor = getDescriptor(object, propertyName);
			if (typeof descriptor.get != "function") delete descriptor.get;
			addBeforeListener(descriptor, "set", listener);
			Object.defineProperty(object, propertyName, descriptor);
		}

		/// Register a listener to be notified after the specified method has been called
		/// Usage: postCall(Object object, String methodName, Function listener);
		inspector.postCall = function (object, methodName, listener) {
			addAfterListener(object, methodName, listener);
		}

		/// Register a listener to be notified after the specified property has been accessed
		/// Usage: postGet(Object object, String propertyName, Function listener);
		inspector.postGet = function (object, propertyName, listener) {
			var descriptor = getDescriptor(object, propertyName);
			if (typeof descriptor.set != "function") delete descriptor.set;
			addAfterListener(descriptor, "get", listener);
			Object.defineProperty(object, propertyName, descriptor);
		}

		/// Register a listener to be notified after the specified property has been set
		/// Usage: postSet(Object object, String propertyName, Function listener);
		inspector.postSet = function (object, propertyName, listener) {
			var descriptor = getDescriptor(object, propertyName);
			if (typeof descriptor.get != "function") delete descriptor.get;
			addAfterListener(descriptor, "set", listener);
			Object.defineProperty(object, propertyName, descriptor);
		}

		//
		// PRIVATE APIs
		//

		/// Collections of active inspector functions and internals
		/// These ensure that only the inspection system can access inspector function internals
		var inspectorFunctions = [];
		var inspectorInternals = [];

		/// Add a listener to be notified after the specified method is called
		function addAfterListener(object, methodName, listener) {
			//if(!object[methodName]) return; // TODO: log info message
			var internals = getInspectorFunctionInternals(object, methodName);
			internals.afterListeners.push(listener);
		}

		/// Add a listener to be notified before the specified method is called
		function addBeforeListener(object, methodName, listener) {
			//if(!object[methodName]) return; // TODO: log info message
			var internals = getInspectorFunctionInternals(object, methodName);
			internals.beforeListeners.push(listener);
		}

		/// Retrieve a getter/setter descriptor for the specified property
		/// Returns the existing getter/setter descriptor if it exists
		/// Otherwise, creates and returns a new getter/setter descriptor
		function getDescriptor(object, propertyName) {
			// Check to see if the property already has a property descriptor
			var descriptor = Object.getOwnPropertyDescriptor(object, propertyName);

			// Check if descriptor doesn't exist or is a simple data descriptor
			if (!descriptor || "value" in descriptor) {
				// Create and assign a basic descriptor if it doesn't exist
				descriptor = inspector.createStorageDescriptor(object[propertyName]);
			}

			// Return the retrieved or newly created descriptor
			return descriptor;
		}

		/// Retrieve the internals of the inspector function set to capture calls to the specified method
		function getInspectorFunctionInternals(object, methodName) {
			// Retrieve the existing API
			var fn = object[methodName];

			// Test if this is an inspector function
			var index = inspectorFunctions.indexOf(fn);

			// If so, return it. We have no need to create another.
			if (index != -1) {
				return inspectorInternals[index];
			}

			// Otherwise, create a new inspector function to listen to calls
			var inspectorFunction = inspectInteraction(fn);

			// Replace the original method with the inspector function
			object[methodName] = inspectorFunction;

			// Return the new function's internals
			return inspectorInternals[inspectorInternals.length - 1];
		}

		/// Create an inspector function to capture and listen to calls to the specified function
		function inspectInteraction(originalFunction) {
			// Inspector Function Internals (Exposed to the inspection system upon request)
			var internals = {
				afterListeners: [], // Listeners notified after the original function is called
				beforeListeners: [] // Listeners notified before the original function is called
			}

			// Declare the inspector function
			function inspectorFunction() {
				// Store a reference to the current object represented by 'this'
				var target = this;

				// Store a reference to the current arguments object
				var args = arguments;

				// Initialize result
				var listenerResult;
				var result = undefined;

				// Setup listener call format
				function callListener(listener) {
					logging.debuggable = true;
					listenerResult = listener.call(target, args, result);
					logging.debuggable = false;

					// Allow listeners to override the return value
					if (listenerResult !== undefined) result = listenerResult;
					if (result === inspector.UNDEFINED) result = undefined;
				}

				// Utility function to call a list of listeners
				function callListenerList(list) {
					// Only call listeners if we're not within a hideFromListners call
					if (nPaused == 0) {
						// And automatically hide listeners from each other
						inspector.hideFromListeners(function () {
							inspector.forEach(list, callListener);
						});
					}
				}

				// Call before listeners registered via inspector.preCall(), preGet(), or preSet()
				callListenerList(internals.beforeListeners);

				// Check if we should break for debugging
				// Also ensure we're not within a hideFromListeners call
				if (inspector.doBreak && nPaused == 0) {
					inspector.doBreak = false;

					// IMPORTANT!!!
					// This is a break point triggered by Compat Inspector
					// Look at the next item in the call stack to find the host page code which caused the issue
					debugger;

				}

				// Call the original function
				if (!result) result = originalFunction.apply(target, args);

				// Call after listeners registered via inspector.postCall(), postGet(), or postSet()
				callListenerList(internals.afterListeners);

				// Check if we should break for debugging
				// Also ensure we're not within a hideFromListeners call
				if (inspector.doBreak && nPaused == 0) {
					inspector.doBreak = false;

					// IMPORTANT!!!
					// This is a break point triggered by Compat Inspector
					// Look at the next item in the call stack to find the host page code which caused the issue
					debugger;

				}

				// Return to normal execution
				return result;
			}

			// Register the inspector function and internals with the system
			inspectorFunctions.push(inspectorFunction);
			inspectorInternals.push(internals);

			// Return the inspector function so it can be used to replace the native API
			return inspectorFunction;
		}

	})();

	/// modules.js
	/// Compat Inspector Module Management Library
	/// 
	/// Public APIs
	/// - inspector.modules
	/// - inspector.registerFix()
	/// - inspector.registerTest()
	/// - inspector.trapErrors
	///
	/// Protected APIs
	/// - modules.fixes
	/// - modules.tests

	var modules = { fixes: {}, tests: {} };

	(function () {

		//
		// PUBLIC APIs
		//

		/// Flag indicating whether the inspector should prevent script errors in tests from stopping execution
		inspector.trapErrors = true;

		/// Register a fix with the system
		/// Usage: registerFix(String fixName, String fixSummary, Function fix);
		inspector.registerFix = function (fixName, fixSummary, fix) {
			if (modules.fixes[fixName]) {
				inspector.info("Multiple verifiers named <b><i>" + fixName + "</i></b> were registered.");
			}
			modules.fixes[fixName] = { summary: fixSummary, fn: fix };
		}

		/// Register a test with the system
		/// Usage: registerTest(String testName, String testSummary, Function test);
		inspector.registerTest = function (testName, testSummary, test) {
			if (modules.tests[testName]) {
				inspector.info("Multiple tests named <b><i>" + testName + "</i></b> were registered.");
			}
			modules.tests[testName] = { summary: testSummary, fn: test };
		}

		//
		// PRIVATE APIs
		//

		/// Safely execute a method, trapping any script exceptions so they don't break the system.
		/// If inspector.trapErrors is false, this will perform an unsafe execution so errors can be debugged.
		function safeExec(target, method, args) {
			args = (args) ? args : [];
			var result = { exception: null, returnValue: null };
			if (inspector.trapErrors) {
				// Attempt a safe execution
				try {
					result.returnValue = method.apply(target, args);
				} catch (e) {
					result.exception = e;
				}
			} else {
				// Perform an unsafe execution (used for debugging)
				result.returnValue = method.apply(target, args);
			}
			return result;
		}

		function init() {
			var config = inspector.config;

			if (!session.fixes) session.fixes = {};
			if (!session.tests) session.tests = {};

			// Load modules
			if (!inspector.modules) {
				inspector.modules = [];
				if (config.modules && config.modules.length) {
					config.modules.forEach(
						function (url) {
							var source = inspector.loadSource(inspector.baseURL + url);
							inspector.modules.push(source);
						}
					);
				}
			}

			// Init Modules
			inspector.modules.forEach(
				function (module) {
					if (typeof module == "string") {
						var result = safeExec(inspector, inspector.executeScript, [module]);
						if (result.exception) {
							inspector.info("Module failed during load - <b><i>" + module + "</i></b><br/>" + result.exception);
						}
					} else {
						safeExec(window, module, [inspector]);
					}
				}
			);

			var target, result;

			// Apply Enabled Fixes
			var fix;
			for (fix in modules.fixes) {
				// Attempt to apply the fix if it has been enabled
				if (session.fixes[fix] || session.fixes[fix + location.href]) {
					target = modules.fixes[fix];
					result = safeExec(target, target.fn);
					if (result.exception) {
						inspector.info("Verifier failed during initialization - <b><i>" + fix + "</i></b><br/>" + result.exception);
					} else {
						inspector.info("Verifying: <em>" + fix + "</em><br><br>" + target.summary, fix);
					}
				}
			}

			// Run Enabled Tests
			var test;
			for (test in modules.tests) {
				if (!session.tests[test]) {
					target = modules.tests[test];
					result = safeExec(target, target.fn);
					if (result.exception) {
						inspector.info("Test failed during initialization - <b><i>" + test + "</i></b><br/>" + result.exception);
					}
				}
			}
		}

		inspector.hideFromListeners(init);
	})();

	/// modules-ui.js
	/// Compat Inspector Module Management User Interface Logic

	(function () {

		var fixContainer = $("#manageFixes");
		var testContainer = $("#manageTests");
		var toggleTemplate = $(".toggle");
		var toggleNameTemplate = $(".toggle .name");
		var toggleSummaryTemplate = $(".toggle .summary");

		function attachToggleUI(container, collection, state, inverse, toggler) {
			// Build list
			var item, name, checkbox, elm;
			for (name in collection) {
				item = collection[name];
				toggleNameTemplate.innerHTML = name;
				toggleSummaryTemplate.innerHTML = item.summary;
				elm = toggleTemplate.cloneNode(true);
				elm.style.display = "block";
				checkbox = elm.querySelector("input");
				checkbox.checked = (inverse) ? !state[name] : state[name];
				checkbox.itemName = name;
				checkbox.onclick = toggler;
				container.appendChild(elm);
			}
		}

		function toggleFix() {
			if (!(this.checked)) delete session.fixes[this.itemName];
			else session.fixes[this.itemName] = true;
			inspector.syncSession();
		}

		function toggleTest() {
			if (this.checked) delete session.tests[this.itemName];
			else session.tests[this.itemName] = true;
			inspector.syncSession();
		}

		function init() {
			attachToggleUI(fixContainer, modules.fixes, session.fixes, false, toggleFix);
			attachToggleUI(testContainer, modules.tests, session.tests, true, toggleTest);

			ui.addDetailsTab("Tests", testContainer);
			//ui.addDetailsTab("Verifiers", fixContainer);
		}

		init();

	})();

});

inspector.modules = [

	(function (inspector) {
		// activex.js
		var name = "Possible browser sniffing via <code>window.ActiveXObject</code>";
		var description = "Some sites alter their behavior based on the existence <code>window.ActiveXObject</code>."
			+ " The test warns when script accesses this API."
			+ " The verifier hides this API."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			if (window.ActiveXObject) {
				inspector.postGet(window, "ActiveXObject", function (args, returnValue) {
					if (returnValue) {
						inspector.warn(
							name + "."
								+ " Check 'verify' to mimic other browsers by hiding this API."
								+ resolution
							,
							name
						);
					};
				});
			}
		});

		inspector.registerFix(name, description + resolution, function () {
			delete window.ActiveXObject;
		});
	}),
	(function (inspector) {
		// activex-usage.js
		var name = "ActiveX usage";
		var description = ""
			+ " The test warns when script calls <code>new ActiveXObject()</code>."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://blogs.msdn.com/b/ie/archive/2011/08/31/browsing-without-plug-ins.aspx'>"
			+ "      Provide a plug-in free experience"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var ActiveXObject = window.ActiveXObject;
		inspector.registerTest(name, description, function () {
			if (ActiveXObject) {
				inspector.preCall(window, "ActiveXObject", function (args) {
					inspector.warn(
						name + "."
							+ " This page tries to load an ActiveX control and may not work in the Metro style browsing experience,"
							+ " or in other configurations where plug-ins may be disabled or unavailable."
							+ " If running on the desktop, turn on ActiveX Filtering via \"(gear) > Safety > ActiveX Filtering\""
							+ " to simulate a plug-in free environment. Then verify the page continues to work."
							+ resolution
					);
					return new ActiveXObject(args[0]);
				});
			}
		});

	}),
	(function (inspector) {
		// asp.net.js
		var name = "ASP.NET omits important scripts in IE10"
		var description = " The test warns when ASP.NET code attempts to invoke '__doPostBack()', but the API is not present."
		    + " The verifier defines '__doPostBack()' to simulate correct ASP.NET behavior."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://www.hanselman.com/blog/BugAndFixASPNETFailsToDetectIE10CausingDoPostBackIsUndefinedJavaScriptErrorOrMaintainFF5ScrollbarPosition.aspx'>Patch your server or project</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			inspector.postGet(window, "__doPostBack", function (args, returnValue) {
				if (!returnValue) {
					inspector.error(
						name + "."
							+ " Check 'verify' to define these scripts, simulating correct ASP.NET behavior."

							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {

			window.__doPostBack = function (eventTarget, eventArgument) {
				var theForm = document.forms[0];

				//<input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="" />
				var eventTargetInput = document.createElement("input");
				eventTargetInput.type = "hidden";
				eventTargetInput.name = "__EVENTTARGET";
				eventTargetInput.id = "__EVENTTARGET";
				eventTargetInput.value = eventTarget;
				theForm.insertBefore(eventTargetInput, theForm.firstChild);

				//<input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="" />
				var eventArgumentInput = document.createElement("input");
				eventArgumentInput.type = "hidden";
				eventArgumentInput.name = "__EVENTARGUMENT";
				eventArgumentInput.id = "__EVENTARGUMENT";
				eventArgumentInput.value = eventArgument;
				theForm.insertBefore(eventArgumentInput, eventTargetInput.nextSibling);

				theForm.submit();
			}

		});
	}),
	(function (inspector) {
		// attachEvent.js
		var name = "Possible browser sniffing via <code>attachEvent</code> or <code>detachEvent</code>";
		var description = "Some sites alter their behavior based on the existence of these APIs."
			+ " The test warns when script accesses these APIs."
			+ " The verifier hides these APIs."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		function warn(args, returnValue) {
			if (returnValue) {
				inspector.warn(
					name + "."
						+ " Check 'verify' to mimic other browsers by hiding these APIs."
						+ resolution
					,
					name
				);
			}
		}

		inspector.registerTest(name, description, function () {
			if (window.attachEvent) {
				inspector.postGet(window, "attachEvent", warn);
				inspector.postGet(window, "detachEvent", warn);
				inspector.postGet(document, "attachEvent", warn);
				inspector.postGet(document, "detachEvent", warn);
				inspector.postGet(HTMLElement.prototype, "attachEvent", warn);
				inspector.postGet(HTMLElement.prototype, "detachEvent", warn);
			}
		});

		inspector.registerFix(name, description + resolution, function () {
			delete Window.prototype.attachEvent;
			delete Window.prototype.detachEvent;
			delete Document.prototype.attachEvent;
			delete Document.prototype.detachEvent;
			delete HTMLElement.prototype.attachEvent;
			delete HTMLElement.prototype.detachEvent;
		});
	}),
	(function (inspector) {
		// button.js
		var name = "MouseEvent.button now returns standardized values";
		var description = "This is a deliberate change in IE9 mode and up for interoperability with other browsers"
			+ " and compliance with DOM Level 3 Events."
			+ " This can affect older versions of jQuery UI."
			+ " The test warns when accessing the button property of a MouseEvent with the left mouse button pressed."
			+ " The verifier simulates IE8's return value for the left mouse button.";
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If using jQuery UI prior to 1.8.6, <a href='http://jqueryui.com'>upgrade to the latest version</a></li>"
			+ "    <li>"
			+ "      Otherwise update your code to respond to"
			+ "      <a href='http://msdn.microsoft.com/nb-no/library/ff974877(en-us,VS.85).aspx'>"
			+ "        the new values for the button property"
			+ "      </a>"
			+ "    </li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;
		var notified = false;

		// Register a test to detect when a page encounters this issue
		inspector.registerTest(name, description, function () {
			// Hook for notification of calls to createElement
			inspector.postGet(MouseEvent.prototype, "button", function (args, value) {
				if (isFixEnabled) return; // Don't run the fix is enabled
				if (notified) return; // Only notify once per page since 'mousemove' listeners can hit this repeatedly

				if (value == 0) {
					notified = true;
					inspector.warn(
						name + "."
							+ " This changed in IE9 for interoperability and standards compliance."
							+ " This can affect drag operations in older versions of jQuery UI. "
							+ " Ignore this warning if your site is working correctly."
							+ resolution
						,
						name
					);
				}
			});
		});

		// Register a fix to confirm that changing the detected behavior fixes the page
		inspector.registerFix(name, description + resolution, function () {
			// Set a flag to let our test know that the fix has been enabled
			isFixEnabled = true;

			var _buttonGetter = Object.getOwnPropertyDescriptor(MouseEvent.prototype, "button").get;
			Object.defineProperty(MouseEvent.prototype, "button", {
				get: function () {
					var button = _buttonGetter.apply(this, arguments);
					if (button == 0) return 1; // Left button
					return button;
				}
			});
		});

	}),
	(function (inspector) {
		// createElement.js
		var name = "The createElement API no longer accepts angle brackets '<>'.";
		var description = "This change was made for interoperability with other browsers and compliance with DOM Level 3 Core."
			+ " This change is known to affect older versions of MooTools."
			+ " The test logs an error for each call to the createElement API containing angle brackets '<>'."
			+ " The verifier simulates IE8's behavior for the createElement API through the use of innerHTML.";
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If using MooTools prior to 1.2.5, <a href='http://mootools.net/'>upgrade to the latest version</a></li>"
			+ "    <li>Otherwise see <a href='http://msdn.microsoft.com/en-us/library/ff986077(v=VS.85).aspx'>this IE9 Compatibility Cookbook article</a> for instructions on how to update your code</li>"
			+ "  </ul>"
			+ "</div>"
		;
		var isFixEnabled = false;
		var ignoreMooToolsBehaviorCheck = true;

		// Register a test to detect when a page encounters this issue
		inspector.registerTest(name, description, function () {
			// Hook for notification of calls to createElement
			inspector.preCall(Document.prototype, "createElement", function (args) {
				if (isFixEnabled) return; // Don't run if our fix is enabled

				// Test whether the provided tag name contains angle brackets '<>'
				if (args[0] && args[0].indexOf("<") != -1) {
					// Newer versions of MooTools test for this behavior using createElement("<input name=x>") in a try/catch block
					// Ensure we don't flag an error for the behavior check.
					if (ignoreMooToolsBehaviorCheck && window.MooTools && args[0] === '<input name=x>') {
						// The check only occurs once
						ignoreMooToolsBehaviorCheck = false;
					} else {
						inspector.error(
							"The createElement API no longer accepts angle brackets '&lt;&gt;'."
								+ " This is a deliberate change in IE9 mode and up for interoperability with other browsers"
								+ " and compliance with <a href='http://www.w3.org/TR/DOM-Level-3-Core/'>DOM Level 3 Core</a>."
								+ resolution
							,
							name
						);
					}
				}
			});
		});

		// Register a fix to confirm that changing the detected behavior fixes the page
		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true; // Let our test know this fix is active

			// Store a reference to the native implementation of createElement
			var createElement = Document.prototype.createElement;

			// Override the native implementation of createElement with our own
			Document.prototype.createElement = function (tagName) {
				// Test whether the provided tag name contains angle brackets '<>'
				if (tagName && tagName.indexOf("<") != -1) {
					// Simulate IE8's behavior using innerHTML to parse the element.
					var div = document.createElement("div");
					div.innerHTML = tagName;

					// Grab a reference to the parsed element, remove it, and return it
					var elm = div.firstChild;
					div.removeChild(elm);
					return elm;
				}
					// Otherwise, defer to the native implementation
				else {
					return createElement.apply(this, arguments);
				}
			}
		});

	}),
	(function (inspector) {
		// detect-asp-net.js
		var name = "ASP.NET detection";
		var description = "This test reports if the page is using ASP.NET.";

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.Sys) {
					inspector.info(
						name + "."
							+ " This page is using ASP.NET."
					);
				}
			}, false);
		});

	}),
	(function (inspector) {
		// detect-dojo.js
		var name = "Dojo detection";
		var description = "The test reports the version of Dojo in use if present."
			+ " The verifier substitutes the latest version of Dojo."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://dojotoolkit.org/'>upgrade to the latest version of MooTools</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.dojo) {
					inspector.info(
						name + "."
							+ " This page is using Dojo " + dojo.version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preSet(window, "dojo", function (args) {
				if (once) {
					once = false;
					inspector.loadScript(inspector.baseURL + "frameworks/dojo-testing-only.js");
					throw "Blocking 'dojo' initialization.";
				}
			});
		});

	}),
	(function (inspector) {
		// detect-gwt.js
		var name = "GWT detection";
		var description = "The test reports the version of GWT in use if present.";

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.$gwt_version) {
					inspector.info(
						name + "."
							+ " This page is using GWT " + $gwt_version + "."
					);
				}
			}, false);
		});

	}),
	(function (inspector) {
		// detect-jquery.js
		var name = "jQuery detection";
		var description = "The test reports the version of jQuery in use if present."
			+ " The verifier substitutes the latest version of jQuery."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://jquery.com'>upgrade to the latest version of jQuery</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.jQuery) {
					inspector.info(
						name + "."
							+ " This page is using jQuery " + jQuery.fn.jquery + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preSet(window, "jQuery", function (args) {
				if (once) {
					once = false;
					var jQuery = args[0];
					if (jQuery.noConflict) jQuery.noConflict();
					inspector.loadScript(inspector.baseURL + "frameworks/jquery-testing-only.js");
					if (!jQuery.noConflict) throw "Blocking 'jQuery' initialization.";
					else return jQuery;
				}
			});
		});

	}),
	(function (inspector) {
		// detect-jqueryui.js
		var name = "jQuery UI detection";
		var description = "The test reports the version of jQuery UI in use if present."
			+ " The verifier substitutes the latest version of jQuery UI."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://jqueryui.com'>upgrade to the latest version of jQuery UI</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.jQuery && window.jQuery.ui) {
					inspector.info(
						name + "."
							+ " This page is using jQuery UI " + jQuery.ui.version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once1 = true, once2 = true;;
			inspector.postGet(window, "jQuery", function (args, jQuery) {
				if (jQuery && once1) {
					once1 = false;
					inspector.preGet(jQuery, "ui", function () {
						if (once2) {
							once2 = false;
							inspector.loadScript(inspector.baseURL + "frameworks/jquery-ui-testing-only.js");
							// No need to block anything as jQuery UI will see the injected version and exit gracefully
						}
					});
				}
			});
		});

	}),
	(function (inspector) {
		// detect-modernizr.js
		var name = "Modernizr detection";
		var description = "The test reports the version of Modernizr in use if present."
			+ " The verifier substitutes the latest version of Modernizr."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://www.modernizr.com/'>upgrade to the latest version of Modernizr</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.Modernizr) {
					inspector.info(
						name + "."
							+ " This page is using Modernizr " + Modernizr._version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preCall(Document.prototype, "createElement", function (args) {
				if (once && args[0] == "modernizr") {
					once = false;
					inspector.loadScript(inspector.baseURL + "frameworks/modernizr-testing-only.js");
					throw "Blocking 'Modernizr' initialization.";
				}
			});
		});
	}),
	(function (inspector) {
		// detect-mootools.js
		var name = "MooTools detection";
		var description = "The test reports the version of MooTools in use if present."
			+ " The verifier substitutes the latest version of MooTools."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://mootools.net/'>upgrade to the latest version of MooTools</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.MooTools) {
					inspector.info(
						name + "."
							+ " This page is using MooTools " + MooTools.version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preSet(window, "MooTools", function (args) {
				if (once) {
					once = false;
					inspector.loadScript(inspector.baseURL + "frameworks/mootools-testing-only.js");
					throw "Blocking 'MooTools' initialization.";
				}
			});
		});

	}),
	(function (inspector) {
		// detect-prototype.js
		var name = "Prototype detection";
		var description = "The test reports the version of Prototype in use if present."
			+ " The verifier substitutes the latest version of Prototype."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://prototypejs.org/'>upgrade to the latest version of Prototype</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.Prototype) {
					inspector.info(
						name + "."
							+ " This page is using Prototype " + Prototype.Version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preSet(window, "Prototype", function (args) {
				if (once) {
					once = false;
					inspector.loadScript(inspector.baseURL + "frameworks/prototype-testing-only.js");
					throw "Blocking 'Prototype' initialization.";
				}
			});
		});

	}),
	(function (inspector) {
		// detect-scriptaculous.js
		var name = "script.aculo.us detection";
		var description = "The test reports the version of script.aculo.us in use if present."
			+ " The verifier substitutes the latest version of script.aculo.us."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If 'verify' resolves the issue, <a href='http://script.aculo.us/'>upgrade to the latest version of script.aculo.us</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			window.addEventListener("DOMContentLoaded", function () {
				if (window.Prototype) {
					inspector.info(
						name + "."
							+ " This page is using script.aculo.us " + Scriptaculous.Version + "."
							+ ((inspector.CORS) ? " Check 'verify' to substitute the latest version." : "")
						,
						((inspector.CORS) ? name : null)
					);
				}
			}, false);
		});

		inspector.registerFix(name, description + resolution, function () {
			var once = true;
			inspector.preSet(window, "Scriptaculous", function (args) {
				if (once) {
					once = false;
					inspector.loadScript(inspector.baseURL + "frameworks/scriptaculous-testing-only.js");
					throw "Blocking 'Scriptaculous' initialization";
				}
			});
		});

	}),
	(function (inspector) {
		// documentall.js
		var name = "Possible browser sniffing via <code>document.all</code>";
		var description = "Some sites alter their behavior based on the existence <code>document.all</code>."
			+ " The test warns when script accesses this API."
			+ " The verifier hides this API."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			if (document.all) {
				inspector.postGet(document, "all", function (args, returnValue) {
					if (returnValue) {
						inspector.warn(
							name + "."
								+ " Check 'verify' to mimic other browsers by hiding this API."
								+ resolution
							,
							name
						);
					}
				});
			}
		});

		inspector.registerFix(name, description + resolution, function () {
			delete Document.prototype.all;
		});
	}),
	(function (inspector) {
		// documentFragment.js
		var name = "Document fragments no longer expose Document APIs";
		var description = "This change was made for interoperability with other browsers and compliance with DOM Level 3 Core."
			+ " The test warns when a page tries to access <code>getElementById</code> off a document fragment."
			+ " The verifier uses <code>querySelector</code> to simulate <code>getElementById</code> behavior."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>If querying for elements, use an alternative API like <a href='http://msdn.microsoft.com/en-us/library/cc304115(VS.85).aspx'>querySelectorAll</a></li>"
			+ "    <li>Otherwise, use a full <code>Document</code> instance instead of a <code>DocumentFragment</code></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		function displayMessage() {
			inspector.error(
				name + "."
					+ " This is a deliberate change in IE9 mode and up for interoperability with other browsers"
					+ " and compliance with <a href='http://www.w3.org/TR/DOM-Level-3-Core/'>DOM Level 3 Core</a>."
					+ resolution
				,
				name
			);
		}

		// Register a test to detect when a page encounters this issue
		inspector.registerTest(name, description, function () {
			if (isFixEnabled) return;
			inspector.preGet(DocumentFragment.prototype, "getElementById", displayMessage);
		});

		// Register a fix to confirm that emulating what the page expects fixes the issue
		inspector.registerFix(name, description + resolution, function () {
			// Set a flag to let our test know that the fix has been enabled
			isFixEnabled = true;

			// Override the native implementation
			DocumentFragment.prototype.getElementById = function (id) {
				// Use Selectors API to simulate the desired behavior
				return this.querySelector("#" + id);
			}
		});

	}),
	(function (inspector) {
		// dojoType.js
		var name = "Older versions of Dojo cannot find <code>dojoType</code>";
		var description = "This occurs due to the separation of content attributes and DOM expandos in IE9 mode and up"
			+ " (see <a href='http://msdn.microsoft.com/en-us/library/gg622931(v=VS.85).aspx'>this IE9 Compatibility Cookbook article</a>)."
			+ " The test watches for missing <code>dojoType</code> properties on elements with <code>dojoType</code> attributes."
			+ " The verifier redirects requests for the <code>dojoType</code> property to the <code>dojoType</code> attribute."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://dojotoolkit.org/'>Upgrade to the latest version of Dojo</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;
		var hasBeenHit = false;

		inspector.registerTest(name, description, function () {
			inspector.postGet(Element.prototype, "dojoType", function (args, result) {
				if (isFixEnabled) return; // Don't do anything if the fix is enabled

				// Ensure that no result was found and that the element has a "dojoType" attribute.
				if ("undefined" === typeof (result) && true == this.hasAttribute("dojoType")) {
					// Ensure we only display the error once per frame.
					hasBeenHit = true;
					inspector.error(
						name + "."
							+ " This occurs due to the separation of content attributes and DOM expandos in IE9 mode and up."
							+ " This is a deliberate change for interoperability with other browsers"
							+ " and compliance with <a href='http://www.w3.org/TR/DOM-Level-3-Core/'>DOM Level 3 Core</a>."
							+ " More details can be found in <a href='http://msdn.microsoft.com/en-us/library/gg622931(v=VS.85).aspx'>this IE9 Compatibility Cookbook article</a>."
							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true;

			inspector.postGet(Element.prototype, "dojoType", function (args, result) {
				// Ensure that no result was found and that the element has a "dojoType" attribute.
				if ("undefined" === typeof (result) && true == this.hasAttribute("dojoType")) {
					// Override the native behavior and return the value of the "dojoType" attribute.
					return this.getAttribute("dojoType");
				}
			});
		});
	}),
	(function (inspector) {
		// element-document-jquery.js
		var name = "jQuery 1.4.2 and below identify elements as 'window'";
		var description = "This can affect the behavior of a page in various ways."
			+ " The test detects access to <code>element.document</code>"
			+ " and warns about jQuery impact if an affected version of jQuery is loaded."
			+ " The verifier hides <code>element.document</code> to emulate legacy behavior."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://jqueryui.com'>Upgrade to the latest version of jQuery</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		function isVersionGreater(v1, v2) {
			v1 = v1.split('.');
			v2 = v2.split('.');
			for (var i = 0, n1, n2; i < v1.length; i++) {
				if (i >= v2.length) {
					return true;
				}
				n1 = parseInt(v1[i]);
				n2 = parseInt(v2[i]);
				if (n1 > n2) {
					return true;
				}
				if (n1 < n2) {
					return false;
				}
			}
			return false;
		}

		inspector.registerTest(name, description, function () {
			if (!document.documentElement.document) return;
			inspector.postGet(HTMLElement.prototype, "document", function (args, result) {
				if (result && window.jQuery && !isVersionGreater(window.jQuery.fn.jquery, "1.4.2")) {
					inspector.warn(
						name + ""
							+ " Check 'verify' to hide <code>element.document</code> to correct the mis-identification."
							+ " Ignore this warning if everything is working correctly."
							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			if (!document.documentElement.document) return;
			delete HTMLElement.prototype.document;
		});

	}),
	(function (inspector) {
		// filters.js
		var name = "Legacy filters are no longer supported";
		var description = "IE's legacy CSS filters are no longer supported in IE10 mode and up."
			+ " The test warns when a value is assigned to <code>filter</code> like <code>alpha(opacity=100)</code>."
			+ " The verifier maps <code>filter:alpha(opacity=n)</code> to <code>opacity</code>."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://blogs.msdn.com/b/ie/archive/2011/12/07/moving-to-standards-based-web-graphics-in-ie10.aspx'>"
			+ "      Use a standardized replacement"
			+ "    </a></li>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var regex = /alpha\(opacity=(\d+)/i;

		var isFixEnabled = false;

		inspector.registerTest(name, description, function () {
			if (!window.MSCSSProperties || 'filter' in MSCSSProperties.prototype || isFixEnabled) return;

			inspector.preSet(MSCSSProperties.prototype, "filter", function (args) {
				if (regex.exec(args[0])) {
					inspector.warn(
						name + "."
							+ " Check 'verify' to mimic legacy behavior by mapping <code>filter:alpha(opacity=n)</code> to <code>opacity</code>."
							+ " Also check 'verify' for warnings about 'possible browser sniffing'."
							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			if (!window.MSCSSProperties || 'filter' in MSCSSProperties.prototype) return;

			isFixEnabled = true;

			inspector.preSet(MSCSSProperties.prototype, "filter", function (args) {
				var match = regex.exec(args[0]);
				if (match && match[1]) {
					this.opacity = parseInt(match[1]) / 100;
				}
			});
		});
	}),
	(function (inspector) {
		// getElementsByTagName.js
		var name = "Full tag names must be used with <code>getElementsByTagName</code>";
		var description = "This change was made for interoperability with other browsers and compliance with DOM Level 3 Core."
			+ "The test watches for calls to <code>getElementsByTagName</code> that fail to return any results. "
			+ "When this happens, a check is performed to see if results would have been returned in IE8. "
			+ "The verifier causes <code>getElementsByTagName</cade> to expand its search to include the prefixes of registered namespaces."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>Include the full tag name when calling <code>getElementsByTagName</code> in IE9 mode and up</li>"
			+ "    <li>For most sites, this involves adjusting checks to run the same code path in IE9 and up as other browsers</li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		// Cache references to the native getElementsByTagName implementation
		var getElementsByTagName_Document = Document.prototype.getElementsByTagName;
		var getElementsByTagName_Element = Element.prototype.getElementsByTagName;

		inspector.registerTest(name, description, function () {
			inspector.postCall(Document.prototype, "getElementsByTagName", handleGEBTN);
			inspector.postCall(Element.prototype, "getElementsByTagName", handleGEBTN);
		});

		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true;
			Document.prototype.getElementsByTagName = wrapGEBTN;
			Element.prototype.getElementsByTagName = wrapGEBTN;
		});


		function logError() {
			inspector.error(
				name + "."
					+ " No results were returned by <code>getElementsByTagName</code>,"
					+ " but results would have been returned in IE8."
					+ " This is a deliberate change in IE9 mode and up for interoperability with other browsers"
					+ " and compliance with <a href='http://www.w3.org/TR/DOM-Level-3-Core/'>DOM Level 3 Core</a>."
					+ resolution
				,
				name
			);
		}

		function wrapGEBTN(tagName) {
			var gebtn = (this instanceof Document) ? getElementsByTagName_Document : getElementsByTagName_Element;
			var elements = gebtn.apply(this, arguments);
			if (elements.length == 0) {
				var list = [];
				var namespaces = document.namespaces;
				for (var i = 0, namespace; i < namespaces.length; i++) {
					namespace = namespaces.item(i);
					var extras = gebtn.call(this, namespace.name + ":" + tagName)
					if (extras.length) {
						list = list.concat(toArray(extras));
					}
				}
				if (list.length > 0) return list;
			}
			return elements;
		}

		function handleGEBTN(args, returnValue) {
			if (isFixEnabled) return;
			if (returnValue.length > 0) return; // This is typically only an issue if no elements are matched
			if (!document.namespaces || !document.namespaces.length) return; // This issue can only occur if document.namespaces has been populated

			var gebtn = (this instanceof Document) ? getElementsByTagName_Document : getElementsByTagName_Element;
			var tagName = args[0];
			var namespace;
			for (var i = 0; i < document.namespaces.length; i++) {
				namespace = document.namespaces.item(i);
				if (gebtn.call(this, namespace.name + ":" + tagName).length) {
					logError();
					return;
				}
			}
		}

		function toArray(nodeList) {
			var arr = [];
			for (var i = 0; i < nodeList.length; i++) {
				arr[i] = nodeList[i];
			}
			return arr;
		}

	}),
	(function (inspector) {
		// hierarchyRequestErr.js
		var name = "Adding another root element causes a HIERARCHY_REQUEST_ERR (3)";
		var description = "This change was made for interoperability with other browsers and compliance with DOM Level 3 Core."
			+ " The test errors when the page tries to add a second root element via <code>insertBefore</code> or <code>appendChild</code>."
			+ " The verifier redirects <code>insertBefore</code> and <code>appendChild</code> to <code>document.documentElement</code>."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>Add the element to <code>document.documentElement</code> instead</li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		// Register a test to detect when a page encounters this bug
		inspector.registerTest(name, description, function () {
			// Register for preCall of insertBefore
			inspector.preCall(Node.prototype, "insertBefore", checkForError);

			// Register for preCall of appendChild
			inspector.preCall(Node.prototype, "appendChild", checkForError);
		});

		//
		// This function handles checking for the error condition.
		//
		function checkForError(args, results) {
			if (isFixEnabled) return;
			if (args.length < 1) return;

			if ((this instanceof Document) && (this.documentElement) && (args[0].nodeType == 1)) {
				inspector.error(
					name + "."
						+ " This is a deliberate change in IE9 mode and up for interoperability with other browsers"
						+ " and compliance with <a href='http://www.w3.org/TR/DOM-Level-3-Core/'>DOM Level 3 Core</a>."
						+ resolution
					,
					name
				);
			}
		}

		//
		// Register a fix to confirm that changing the detected behavior fixes the page.
		// This function applies the fix by simply shimming the insertBefore and
		// appendChild methods to call the this.documentElement method.
		//
		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true;

			document.insertBefore = function (arg1, arg2) {
				// For the insertBefore scenario, we call appendChild which makes it a 
				// simpler "fix", rather than try to make things work if a second
				// argument is passed in.  This should allow the user to apply fix and
				// confirm the core issuue.
				this.documentElement.appendChild(arg1);
			}

			document.appendChild = function (arg1) {
				this.documentElement.appendChild(arg1);
			}
		});

	}),
	(function (inspector) {
		// msxml.js
		var name = "MSXML objects cannot be inserted directly into a page";
		var description = "The test errors when a page provides an MSXML object to the native"
			+ " <code>adoptNode</code>, <code>importNode</code>, <code>appendChild</code>, or <code>insertBefore</code> APIs."
			+ " The verifier causes <code>responseXML</code> to be generated using <code>DOMParser</code>."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>"
			+ "      Use <code>DOMParser</code> instead. See"
			+ "      <a href='https://blogs.msdn.com/b/ie/archive/2010/10/15/domparser-and-xmlserializer-in-ie9-beta.aspx'>"
			+ "        this blog post"
			+ "      </a>"
			+ "      for more details."
			+ "    </li>"
			+ "    <li>"
			+ "      Alternatively, update your code to distinguish between MSXML nodes and native nodes:"
			+ "<pre>if(!window.Node || !(node instanceof Node)) {\n"
			+ "    // This is an MSXML node\n"
			+ "}</pre>"
			+ "    </li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		function displayMessage(n) {
			inspector.error(
				name + "."
					+ " Check 'verify' to attempt to convert the MSXML object to a native DOM."
					+ resolution
				,
				name
			);
		}

		// Register a test to detect when a page encounters this bug
		inspector.registerTest(name, description, function () {
			// Verify that the first parameter is a native node
			function verifyNativeNode(args) {
				// Don't run if our fix is enabled
				if (isFixEnabled) return;

				// Test whether the provided node is native
				if (args[0].nodeType && !(args[0] instanceof Node)) {
					displayMessage();
				}
			}

			// Override the appropriate APIs
			inspector.preCall(Document.prototype, "adoptNode", verifyNativeNode);
			inspector.preCall(Document.prototype, "importNode", verifyNativeNode);
			inspector.preCall(Node.prototype, "appendChild", verifyNativeNode);
			inspector.preCall(Node.prototype, "insertBefore", verifyNativeNode);
		});

		// Register a fix to confirm that emulating what the page expects fixes the issue
		inspector.registerFix(name, description + resolution, function () {
			// Set a flag to let our test know that the fix has been enabled
			isFixEnabled = true;

			// Override the native implementation of responseXML with our own
			var parser = new DOMParser();
			Object.defineProperty(XMLHttpRequest.prototype, "responseXML", {
				get: function () {
					return parser.parseFromString(this.responseText, "text/xml");
				}
			});
		});


	}),
	(function (inspector) {
		// navigator-appname.js
		var name = "Possible browser sniffing via <code>navigator.appName</code>";
		var description = "Some sites alter their behavior based on the value of <code>navigator.appName</code>."
			+ " The test warns when script accesses this API."
			+ " The verifier changes this API to return 'Netscape' to mimic other browsers."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			inspector.postGet(navigator, "appName", function (args, returnValue) {
				if (returnValue != "Netscape") {
					inspector.warn(
						name + "."
							+ " Check 'verify' to mimic other browsers by returning 'Netscape'."
							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			inspector.postGet(navigator, "appName", function () {
				return "Netscape";
			});
		});
	}),
	(function (inspector) {
		// navigator-product.js
		var name = "Possible browser sniffing via <code>navigator.product</code>";
		var description = "Some sites alter their behavior based on the value of <code>navigator.product</code>."
			+ " The test warns when script accesses this API."
			+ " The verifier changes this API to return 'Mozilla' to mimic other browsers."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		inspector.registerTest(name, description, function () {
			inspector.postGet(navigator, "product", function (args, returnValue) {
				if (returnValue != "Mozilla") {
					inspector.warn(
						name + "."
							+ " Check 'verify' to mimic other browsers by returning 'Mozilla'."
							+ resolution
						,
						name
					);
				}
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			inspector.postGet(navigator, "product", function () {
				return "Mozilla";
			});
		});
	}),
	(function (inspector) {
		// pointerEvents.js
		var name = "Pointer Events detection";
		var description = "This test detects when a site is optimized for Pointer Events."
		;

		var pointerEvents = ['MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerCancel'];
		function logWarning() {
			inspector.info(
					name + "."
						+ " This site has optimized for touch/pen input using Pointer Events.  Ignore warnings about Touch Events, if present."
				);
		}

		function checkEvents(args, returnValue) {
			if (args[0] && pointerEvents.indexOf(args[0]) >= 0) {
				logWarning();
			}
		}

		inspector.registerTest(name, description, function () {
			if (window.addEventListener) {
				inspector.preCall(window, "addEventListener", checkEvents);
				inspector.preCall(window, "removeEventListener", checkEvents);
				inspector.preCall(document, "addEventListener", checkEvents);
				inspector.preCall(document, "removeEventListener", checkEvents);
				inspector.preCall(HTMLElement.prototype, "addEventListener", checkEvents);
				inspector.preCall(HTMLElement.prototype, "removeEventListener", checkEvents);
			}
			inspector.preSet(Element.prototype, "onmspointerdown", logWarning);
			inspector.preSet(Element.prototype, "onmspointerup", logWarning);
			inspector.preSet(Element.prototype, "onmspointermove", logWarning);
			inspector.preSet(Element.prototype, "onmspointerover", logWarning);
			inspector.preSet(Element.prototype, "onmspointerout", logWarning);
			inspector.preSet(Element.prototype, "onmspointercancel", logWarning);
			inspector.preSet(document, "onmspointerdown", logWarning);
			inspector.preSet(document, "onmspointerup", logWarning);
			inspector.preSet(document, "onmspointermove", logWarning);
			inspector.preSet(document, "onmspointerover", logWarning);
			inspector.preSet(document, "onmspointerout", logWarning);
			inspector.preSet(document, "onmspointercancel", logWarning);
			inspector.preSet(window, "onmspointerdown", logWarning);
			inspector.preSet(window, "onmspointerup", logWarning);
			inspector.preSet(window, "onmspointermove", logWarning);
			inspector.preSet(window, "onmspointerover", logWarning);
			inspector.preSet(window, "onmspointerout", logWarning);
			inspector.preSet(window, "onmspointercancel", logWarning);
		});
	}),
	(function (inspector) {
		// touchEvents.js
		var name = "Touch Events detection";
		var description = "This site uses <code>touchstart</code>, <code>touchmove</code>, and <code>touchend</code>, which are part of a different model for handling"
			+ "touch input than what is supported in Internet Explorer."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>This site should update to also support hardware agnostic <a href=\"http://msdn.microsoft.com/en-us/library/hh673557.aspx\">Pointer Events</a>."
			+ "    </li>"
			+ "  </ul>"
			+ "</div>"
		;
		var isFixEnabled = false;

		var touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
		function logWarning() {
			inspector.warn(
					name + "."
						+ " Check 'verify' and refresh to simulate Touch Events based on Pointer Events (IE10 only)."
						+ resolution
					,
					name
				);
		}

		function checkEvents(args, returnValue) {
			if (args[0] && touchEvents.indexOf(args[0]) >= 0) {
				logWarning();
			}
		}

		inspector.registerTest(name, description, function () {
			if (isFixEnabled)
				return; //Don't trigger the warning if the verifier is enabled
			if (window.addEventListener) {
				inspector.preCall(window, "addEventListener", checkEvents);
				inspector.preCall(window, "removeEventListener", checkEvents);
				inspector.preCall(document, "addEventListener", checkEvents);
				inspector.preCall(document, "removeEventListener", checkEvents);
				inspector.preCall(HTMLElement.prototype, "addEventListener", checkEvents);
				inspector.preCall(HTMLElement.prototype, "removeEventListener", checkEvents);
			}
			inspector.preSet(HTMLElement.prototype, "ontouchstart", logWarning);
			inspector.preSet(HTMLElement.prototype, "ontouchmove", logWarning);
			inspector.preSet(HTMLElement.prototype, "ontouchend", logWarning);
			inspector.preSet(HTMLElement.prototype, "ontouchcancel", logWarning);
			inspector.preSet(document, "ontouchstart", logWarning);
			inspector.preSet(document, "ontouchmove", logWarning);
			inspector.preSet(document, "ontouchend", logWarning);
			inspector.preSet(document, "ontouchcancel", logWarning);
			inspector.preSet(window, "ontouchstart", logWarning);
			inspector.preSet(window, "ontouchmove", logWarning);
			inspector.preSet(window, "ontouchend", logWarning);
			inspector.preSet(window, "ontouchcancel", logWarning);
		});

		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true;

			(function () {
				//If the site listens to Pointer Events, then unhook this fix's listeners to Pointer to avoid firing both Pointer and Touch Events
				//(also protects against potential recursion where this Compat Inspector module 
				if (window.addEventListener) {
					inspector.preCall(window, "addEventListener", checkForPointerEvents);
					inspector.preCall(window, "removeEventListener", checkForPointerEvents);
					inspector.preCall(document, "addEventListener", checkForPointerEvents);
					inspector.preCall(document, "removeEventListener", checkForPointerEvents);
					inspector.preCall(HTMLElement.prototype, "addEventListener", checkForPointerEvents);
					inspector.preCall(HTMLElement.prototype, "removeEventListener", checkForPointerEvents);
				}
				inspector.preSet(Element.prototype, "onmspointerdown", disableFix);
				inspector.preSet(Element.prototype, "onmspointerup", disableFix);
				inspector.preSet(Element.prototype, "onmspointermove", disableFix);
				inspector.preSet(Element.prototype, "onmspointerover", disableFix);
				inspector.preSet(Element.prototype, "onmspointerout", disableFix);
				inspector.preSet(Element.prototype, "onmspointercancel", disableFix);
				inspector.preSet(document, "onmspointerdown", disableFix);
				inspector.preSet(document, "onmspointerup", disableFix);
				inspector.preSet(document, "onmspointermove", disableFix);
				inspector.preSet(document, "onmspointerover", disableFix);
				inspector.preSet(document, "onmspointerout", disableFix);
				inspector.preSet(document, "onmspointercancel", disableFix);
				inspector.preSet(window, "onmspointerdown", disableFix);
				inspector.preSet(window, "onmspointerup", disableFix);
				inspector.preSet(window, "onmspointermove", disableFix);
				inspector.preSet(window, "onmspointerover", disableFix);
				inspector.preSet(window, "onmspointerout", disableFix);
				inspector.preSet(window, "onmspointercancel", disableFix);
				function checkForPointerEvents(args, returnValue) {
					var pointerEvents = ['MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerOver', 'MSPointerOut', 'MSPointerCancel'];
					if (args[0] && pointerEvents.indexOf(args[0]) >= 0 && args[1] != fireTouchEvent)
						disableFix();
				}
				function disableFix() {
					document.removeEventListener("MSPointerDown", fireTouchEvent, true);
					document.removeEventListener("MSPointerMove", fireTouchEvent, true);
					document.removeEventListener("MSPointerUp", fireTouchEvent, true);
					document.removeEventListener("MSPointerCancel", fireTouchEvent, true);
					document.removeEventListener("MSLostPointerCapture", cleanupArrays, true);
					if (window.console && window.console.warn)
						window.console.warn("The Compat Inspector " + name + " verifier was disabled because this page is also listening to Pointer Events.");
				}
				//Polyfill for TouchEvents in Internet Explorer 10
				//Configuration
				var fireTouchFromMouse = true;  //Fires touch events when using a mouse

				//TouchEvent interfaces
				window.TouchEvent = function (type, propertyBag) {
					var event = document.createEvent("UIEvent");
					Object.defineProperty(event, "touches", { get: getTouches });
					Object.defineProperty(event, "targetTouches", { get: getTargetTouches });
					Object.defineProperty(event, "changedTouches", { get: getChangedTouches });
					this.altKey = (propertyBag && propertyBag["altKey"]) || false;
					this.metaKey = (propertyBag && propertyBag["metaKey"]) || false;
					this.ctrlKey = (propertyBag && propertyBag["ctrlKey"]) || false;
					this.shiftKey = (propertyBag && propertyBag["shiftKey"]) || false;
					event.initUIEvent(type, true, true, window, null);
					return event;
				}

				var Touch = function (id, target, screenX, screenY, clientX, clientY, pageX, pageY) {
					this.identifier = id || 0;
					this.target = target || window;
					this.screenX = screenX || 0;
					this.screenY = screenY || 0;
					this.clientX = clientX || 0;
					this.clientY = clientY || 0;
					this.pageX = pageX || 0;
					this.pageY = pageY || 0;
				};

				//Touch arrays
				var touches = [];
				var changedTouches = [];

				var touchLookup = []; //A lookup table to index touches by identifier
				touchLookup.update = function () {
					//Used when items are removed from touches and therefore the lookup table is dirty
					for (var i = 0; i < touches.length; i++)
						touchLookup[touches[i].identifier] = i;
				}
				//For touches, we have a fast lookup table
				touches.identifiedTouch = function (id) {
					return this[touchLookup[id]] || null;
				}
				//For changedTouches (and targetTouches below), use the generic implementation
				changedTouches.identifiedTouch = identifiedTouch;
				var identifiedTouch = function (id) {
					for (var t in this)
						if (this[t].identifier === id)
							return this[t];
					return null; //TODO: what should this be? (it's not defined in the spec)
				}

				//Getters
				function getTouches() {
					return touches;
				}
				function getChangedTouches() {
					return changedTouches;
				}
				function getTargetTouches() {
					var targetTouches = [];
					targetTouches.identifiedTouch = identifiedTouch;
					for (var t in touches)
						if (touches[t].target === this.target)
							targetTouches.push(touches[t]);
					return targetTouches;
				}

				//Touch styles - disables pan/zoom manipulation in order to enable reliable touch events
				document.documentElement.style.msTouchAction = "none";

				//Pointer Event handlers
				document.addEventListener("MSPointerDown", fireTouchEvent, true);
				document.addEventListener("MSPointerMove", fireTouchEvent, true);
				document.addEventListener("MSPointerUp", fireTouchEvent, true);
				document.addEventListener("MSPointerCancel", fireTouchEvent, true);
				document.addEventListener("MSLostPointerCapture", cleanupArrays, true);


				//Touch Event dispatcher

				function fireTouchEvent(evt) {
					inspector.hideFromListeners(function () {
						//Don't fire touch events for mouse unless configured to do so and the mouse button is down
						if (!fireTouchFromMouse && evt.pointerType == 4)
							return;

						var touchType;
						switch (evt.type) {
							case "MSPointerDown":
								touchType = "touchstart";
								//Populate the touches array with the new contact
								var newTouch = new Touch(evt.pointerId, evt.target, evt.screenX, evt.screenY, evt.clientX, evt.clientY, evt.pageX, evt.pageY);
								touchLookup[newTouch.identifier] = touches.push(newTouch) - 1; //Add it to the touches array and put an entry in the lookup table so we can access it by id later
								//Populate the changedTouches array.  IE fires 1 event for every change in every contact. So there can only be 1 contact in changedTouches at a time.
								changedTouches[0] = newTouch;
								//Set touch action to support events
								evt.target.style.msTouchAction = "none";
								//Set capture for this contact
								evt.target.msSetPointerCapture(evt.pointerId);
								break;

							case "MSPointerMove":
								//Don't fire touch for mouse if the mouse button's not down
								if (evt.pointerType == 4 && evt.button == 0)
									return;
								touchType = "touchmove";
								//Lookup the touch contact in touches array
								var i = touchLookup[evt.pointerId];
								//Coalesce pointer move's (fired at an regular interval, regardless of it the pointer moved)
								if (touches[i].screenX == evt.screenX && touches[i].screenY == evt.screenY)
									return;
								//Update contact's coordinates
								touches[i].screenX = evt.screenX;
								touches[i].screenY = evt.screenY;
								touches[i].clientX = evt.clientX;
								touches[i].clientY = evt.clientY;
								touches[i].pageX = evt.pageX;
								touches[i].pageY = evt.pageY;
								//Populate changedTouches
								changedTouches[0] = touches[i];
								break;

							case "MSPointerUp":
								touchType = "touchend";
								//Removed contacts should be in changedTouches, but not touches or targetTouches
								changedTouches[0] = touches[touchLookup[evt.pointerId]];
								touches.splice(touchLookup[evt.pointerId], 1);
								touchLookup.update(); //The lookup table is now dirty, need to update it
								break;

							case "MSPointerCancel":
								touchType = "touchcancel";
								//Removed contacts should be in changedTouches, but not touches or targetTouches
								changedTouches[0] = touches[touchLookup[evt.pointerId]];
								touches.splice(touchLookup[evt.pointerId], 1);
								touchLookup.update(); //The lookup table is now dirty, need to update it
								break;
						}
						//Create the touch event
						var touchEvent = new TouchEvent(touchType, {
							altKey: evt.altKey,
							metaKey: evt.metaKey,
							ctrlKey: evt.ctrlKey,
							shiftKey: evt.shiftKey
						});
						//Dispatch it
						if (!evt.target.dispatchEvent(touchEvent)) {
							evt.preventDefault();
							if (evt.preventManipulation)
								evt.preventManipulation();
							if (evt.preventMouseEvent)
								evt.preventMouseEvent();
						}
					});
				}

				function cleanupArrays(evt) {
					//There are cases (like dragging selected text) where touchJS will lose its capture of a touch contact
					//This cleans up the touches array to ensure they're not left behind in this scenario
					if (touches.identifiedTouch(evt.pointerId)) {
						touches.splice(touchLookup[evt.pointerId], 1);
						touchLookup.update(); //The lookup table is now dirty, need to update it
					}
				}
			})();
		});
	}),
	(function (inspector) {
		// ua.js
		var name = "Possible browser sniffing via <code>navigator.userAgent</code>"
		var description = "Some sites alter their behavior based on the value of the user agent string."
			+ " The test warns when script accesses this API."
			+ " The verifier changes the return value of this API to mimic other browsers."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://msdn.microsoft.com/en-us/library/ff986088(v=VS.85).aspx'>"
			+ "      Use feature detection"
			+ "    </a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var uaString = "";

		inspector.registerTest(name, description, function () {
			inspector.preGet(navigator, "userAgent", function () {
				if (uaString) {
					return uaString;
				} else {
					inspector.warn(
						name + "."
							+ " Check 'verify' to mimic other browsers by returning a different user agent string."
							+ resolution
						,
						name
					);
				};
			});
		});

		inspector.registerFix(name, description + resolution, function () {
			uaString = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.63 Safari/535.7";
		});
	}),
	(function (inspector) {
		// vml-cufon.js
		var name = "Cufon less than 1.09i uses VML";
		var description = "The test warns on access to <code>document.namespaces</code> when Cufon is loaded."
			+ " Versions of Cufon prior to 1.09i will use a VML engine causing noticeable page"
			+ " layout/rendering problems due to other IE9 changes."
			+ " The verifier hides <code>document.namespaces</code>, causing Cufon to use its <code>&lt;canvas&gt;</code> engine."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li><a href='http://cufon.shoqolate.com/generate/'>Upgrade to the latest version of Cufon</a></li>"
			+ "  </ul>"
			+ "</div>"
		;

		var isFixEnabled = false;

		// Register a test to detect when a page encounters this issue
		inspector.registerTest(name, description, function () {
			if (!document.namespaces || isFixEnabled) return;

			// Hook for notification of calls to Cufon.registerEngine
			inspector.preGet(Document.prototype, "namespaces", function (args, result) {
				if (typeof Cufon != "undefined") {
					inspector.warn(
						name + ":"
							+ " This can cause layout and rendering problems in IE9 mode and up."
							+ " Check 'verify' to cause Cufon to use <code>&lt;canvas&gt;</code> instead."
							+ " Ignore this warning if you are not using Cufon less than 1.09i."
							+ resolution
						,
						name
					);
				}
			});
		});

		// Register a fix to confirm that changing the detected behavior fixes the page
		inspector.registerFix(name, description + resolution, function () {
			if (!document.namespaces) return;
			isFixEnabled = true;

			// The fix is to return null for document.namespaces, which will cause the Cufon library to
			// create a <canvas> engine which should make the UI work.
			var descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "namespaces");
			descriptor.get = function () {
				return null;
			}
			Object.defineProperty(Document.prototype, "namespaces", descriptor);
		});

	}),
	(function (inspector) {
		// write.js
		var name = "Cached reference to <code>document.write</code>";
		var description = "The test checks for calls like <code>var write = document.write; write(source)</code>."
			+ " These calls trigger the script error"
			+ " <em>'SCRIPT65535: Invalid this pointer used as target for method call'</em>."
			+ " The verifier emulates legacy behavior by always invoking <code>document.write</code>"
			+ " and <code>document.writeln</code> against the primary document."
		;
		var resolution = ""
			+ "<div class='resolution'>"
			+ "  <ul>"
			+ "    <li>See <a href='http://msdn.microsoft.com/en-us/library/gg622930(v=VS.85).aspx'>this IE9 Compatibility Cookbook article</a> for instructions</li>"
			+ "  </ul>"
			+ "</div>"
		;
		var isFixEnabled = false;

		inspector.registerTest(name, description, function () {
			// Hook for notification of calls to document.writeln
			inspector.preCall(Document.prototype, "writeln", preCallListener);

			// Hook for notification of calls to document.write
			inspector.preCall(Document.prototype, "write", preCallListener);
		});

		// This function is used in the inspector.preCall's to check and see
		// if the calling object is the window.document or not.
		// If not, then the error is displayed.
		function preCallListener(args, value) {
			if (isFixEnabled) return;

			if (this != window.document) {
				inspector.error(
					name + "."
						+ " The page contains code with the pattern <code>var write = document.write; write(source)</code>."
						+ " This is no longer supported in IE9 mode and up for interoperability with other browsers."
						+ resolution
					,
					name
				);
			}
		}

		// Register a fix to confirm that changing the detected behavior fixes the page
		inspector.registerFix(name, description + resolution, function () {
			isFixEnabled = true;

			// Store references to the native implementations
			var documentWrite = Document.prototype.write;
			var documentWriteLn = Document.prototype.writeln;

			// Override the native implementation with our own, if 
			// this is being called from a 'cached' reference.
			Document.prototype.writeln = function (strText) {
				if (this == window.document) {
					return documentWriteLn.apply(this, arguments);
				} else {
					return documentWriteLn.call(document, strText);
				}
			}

			Document.prototype.write = function (strText) {
				if (this == window.document) {
					return documentWrite.apply(this, arguments);
				} else {
					return documentWrite.call(document, strText);
				}
			}
		});

	})
];

inspector.source.ui = "<!DOCTYPE html><html><head><title>UI</title><base target='_blank'/></head><body>"
	+ "<!--"
	+ "/// ui.html"
	+ "/// Compat Inspector User Interface"
	+ "-->"
	+ "<style>"
	+ "	@keyframes show {"
	+ "		0% { opacity: 0; transform: translate(50px, 0); }"
	+ "		100% { opacity: 1; transform: translate(0, 0); }"
	+ "	}"
	+ "	@-moz-keyframes show {"
	+ "		0% { opacity: 0; -moz-transform: translate(50px, 0); }"
	+ "		100% { opacity: 1; -moz-transform: translate(0, 0); }"
	+ "	}"
	+ "	@-ms-keyframes show {"
	+ "		0% { opacity: 0; -ms-transform: translate(50px, 0); }"
	+ "		100% { opacity: 1; -ms-transform: translate(0, 0); }"
	+ "	}"
	+ "	@-o-keyframes show {"
	+ "		0% { opacity: 0; -o-transform: translate(50px, 0); }"
	+ "		100% { opacity: 1; -o-transform: translate(0, 0); }"
	+ "	}"
	+ "	@-webkit-keyframes show {"
	+ "		0% { opacity: 0; -webkit-transform: translate(50px, 0); }"
	+ "		100% { opacity: 1; -webkit-transform: translate(0, 0); }"
	+ "	}"
	+ "	"
	+ "	.templates {"
	+ "		display: none;"
	+ "	}"
	+ "	"
	+ "	#inspectorUI {"
	+ "		font-family: calibri, arial, sans-serif; "
	+ "		font-size: 12px;"
	+ "		position: fixed;"
	+ "		top: 0; "
	+ "		left: 0; "
	+ "		bottom: 0; "
	+ "		right: 0;"
	+ "		-ms-user-select: none;"
	+ "		-moz-user-select: -moz-none;"
	+ "		-webkit-user-select: none;"
	+ "	}"
	+ "	"
	+ "	#statusArea {"
	+ "		display: none;"
	+ "		background-color: #000;"
	+ "		border: none;"
	+ "		cursor: pointer; "
	+ "		padding: 4px; "
	+ "		position: absolute; "
	+ "		text-align: center; "
	+ "		top: 0;"
	+ "		right: 0;"
	+ "	}"
	+ "	"
	+ "	#statusTitle {"
	+ "		display: none;"
	+ "	}"
	+ "	"
	+ "	#detailsArea {"
	+ "		display: none;"
	+ "		background-color: #000; "
	+ "		color: #fff;"
	+ "		position: absolute; "
	+ "		top: 0;"
	+ "		left: 0; "
	+ "		bottom: 0; "
	+ "		right: 0; "
	+ "		-ms-content-zooming: none;"
	+ "	}"
	+ "	"
	+ "	#detailsArea.show,"
	+ "	#statusArea.show,"
	+ "	.content.show {"
	+ "		display: block;"
	+ "		animation: show 0.5s ease;"
	+ "		-moz-animation: show 0.5s ease;"
	+ "		-ms-animation: show 0.5s ease;"
	+ "		-o-animation: show 0.5s ease;"
	+ "		-webkit-animation: show 0.5s ease;"
	+ "	}"
	+ "	"
	+ "	#detailsTitle {"
	+ "		color: #fff;"
	+ "		cursor: default;"
	+ "		font-family: Segoe UI Light;"
	+ "		font-size: 42pt;"
	+ "		font-weight: normal;"
	+ "		position: absolute;"
	+ "		top: 40px;"
	+ "		left: 120px;"
	+ "	}"
	+ "	"
	+ "	#sections {"
	+ "		position: absolute;"
	+ "		top: 130px;"
	+ "		left: 100px;"
	+ "		z-index: 2;"
	+ "	}"
	+ "	"
	+ "	#tabRow {"
	+ "		display: inline-block;"
	+ "		margin: 0;"
	+ "		padding: 0;"
	+ "	}"
	+ "	"
	+ "	#tabContent {"
	+ "		clear: both;"
	+ "		overflow: auto;"
	+ "		overflow-x: hidden;"
	+ "		-ms-scroll-style: indicator-only;"
	+ "		position: absolute;"
	+ "		top: 180px;"
	+ "		left: 0;"
	+ "		right: 0;"
	+ "		bottom: 0;"
	+ "		z-index: 1;"
	+ "		font-family: Segoe UI Semilight, sans-serif;"
	+ "		font-size: 11pt;"
	+ "	}"
	+ "	"
	+ "	.content {"
	+ "		display: none;"
	+ "	}"
	+ "	"
	+ "	.content > p {"
	+ "		margin: 0 20px 20px 120px;"
	+ "	}"
	+ "	"
	+ "	a {"
	+ "		color: #26a0da;"
	+ "		text-decoration: none;"
	+ "	}"
	+ "	"
	+ "	.tab, .help {"
	+ "		font-family: Segoe UI Light, sans-serif;"
	+ "		font-size: 20pt;"
	+ "		text-decoration: none;"
	+ "		padding: 0 20px;"
	+ "		display: inline-block;"
	+ "		color: #a7a7a7;"
	+ "		cursor: pointer;"
	+ "		border: none;"
	+ "		background-color: transparent;"
	+ "		margin: 0;"
	+ "	}"
	+ "	"
	+ "	.active.tab {"
	+ "		color: #fff;"
	+ "		cursor: default;"
	+ "		text-decoration: none;"
	+ "	}"
	+ "	"
	+ "	.tab:focus {"
	+ "		outline: none;"
	+ "	}"
	+ "	"
	+ "	#changeNotification {"
	+ "		background-color: #fff;"
	+ "		color: #000;"
	+ "		position: absolute;"
	+ "		top: 0;"
	+ "		right: 0;"
	+ "		font-size: 20pt;"
	+ "		padding: 20px;"
	+ "	}"
	+ "	"
	+ "	#backButton {"
	+ "		position: absolute;"
	+ "		top: 60px;"
	+ "		left: 40px;"
	+ "		width: 40px;"
	+ "		height: 40px;"
	+ "		padding: 0;"
	+ "		border-radius: 50%;"
	+ "		border-width: 2px;"
	+ "		border-style: solid;"
	+ "		border-color: #fff;"
	+ "		box-sizing: border-box;"
	+ "		background-color: transparent;"
	+ "		background-image: url('data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2219%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M%200%2C9.5%209%2C0%20l%207%2C0%20-7%2C7%2015%2C0%200%2C5%20-15%2C0%207%2C7%20-7%2C0%20z%22%2F%3E%3C%2Fsvg%3E');"
	+ "		background-position: center;"
	+ "		background-repeat: no-repeat;"
	+ "	}"
	+ "	#backButton:active {"
	+ "		opacity: 0.5;"
	+ "	}"
	+ "</style>"

	+ "<!-- BEGIN: Primary UI -->"
	+ "<div id='inspectorUI'>"
	+ "	"
	+ "	<!-- BEGIN: Status Area -->"
	+ "	<button id='statusArea' title='Click to show Compat Inspector details'>"
	+ "		<div id='statusTitle'>"
	+ "			Compat Inspector"
	+ "		</div>"
	+ "	</button>"
	+ "	<!-- END: Status Area -->"
	+ "	"
	+ "	<!-- BEGIN: Details Area -->"
	+ "	<div id='detailsArea'>"
	+ "		<div id='detailsTitle'>"
	+ "			Compat Inspector"
	+ "		</div>"
	+ "		<!--"
	+ "		<div id=\"changeNotification\">"
	+ "			Refresh the page to apply changes."
	+ "		</div>"
	+ "		-->"
	+ "		<button id=\"backButton\"></button>"
	+ "		<div id='sections'>"
	+ "			<div id='tabRow'></div>"
	+ "			<a class='help' target=\"_blank\" href='http://ie.microsoft.com/testdrive/HTML5/CompatInspector/help/post.htm'>Help</a>"
	+ "		</div>"
	+ "		<div id='tabContent'></div>"
	+ "	</div>"
	+ "	<!-- END: Details Area -->"
	+ "</div>"
	+ "<!-- END: Primary UI -->"

	+ "<!-- BEGIN: Templates -->"
	+ "<div class='templates'>"
	+ "	"
	+ "	<!-- BEGIN: Tab Template -->"
	+ "	<button class='tab'></button>"
	+ "	<!-- END: Tab Template -->"
	+ "	"
	+ "</div>"
	+ "<!-- END: Templates -->"

	+ "<!--"
	+ "/// logging-ui.html"
	+ "/// Compat Inspector Message Logging User Interface"
	+ "-->"
	+ "<style>"
	+ "	"
	+ "	.counter {"
	+ "		background-color: #333;"
	+ "		border: none;"
	+ "		display: inline-block;"
	+ "		color: #fff;"
	+ "		font-family: Segoe UI Light, sans-serif;"
	+ "		font-size: 20pt;"
	+ "		margin: 5px;"
	+ "		padding: 4px 10px;"
	+ "	}"
	+ "	"
	+ "	.error {"
	+ "		border-left: 10px solid #f10;"
	+ "	}"
	+ "	"
	+ "	.warn {"
	+ "		border-left: 10px solid #fc0;"
	+ "	}"
	+ "	"
	+ "	.info {"
	+ "		border-left: 10px solid #09f;"
	+ "	}"
	+ "	"
	+ "	.counter > *:nth-child(1) {"
	+ "		display: none;"
	+ "	}"
	+ "	"
	+ "	#message-details > h1 {"
	+ "		font-family: Segoe UI Semibold;"
	+ "		font-size: 11pt;"
	+ "		font-weight: normal;"
	+ "		padding-left: 120px;"
	+ "		margin: 20px 0;"
	+ "	}"
	+ "	"
	+ "	.message {"
	+ "		clear: both;"
	+ "		display: block;"
	+ "		background-color: #333;"
	+ "		border-left-width: 20px;"
	+ "		font-family: Segoe UI Semilight, sans-serif; "
	+ "		font-size: 11pt;"
	+ "		margin: 0 20px 20px 120px;"
	+ "		padding: 20px;"
	+ "		position: relative;"
	+ "	}"
	+ "	"
	+ "	.message > p {"
	+ "		margin: 20px 0 0 0;"
	+ "	}"
	+ "	"
	+ "	#messages .message {"
	+ "		cursor: pointer;"
	+ "		transition: transform 0.1s ease;"
	+ "		-moz-transition: -moz-transform 0.1s ease;"
	+ "		-ms-transition: -ms-transform 0.1s ease;"
	+ "		-o-transition: -o-transform 0.1s ease;"
	+ "		-webkit-transition: -webkit-transform 0.1s ease;"
	+ "	}"
	+ "	"
	+ "	.debug-toggle, .fix-toggle {"
	+ "		float: right;"
	+ "		margin: -20px;"
	+ "		padding: 20px;"
	+ "		padding-left: 30px;"
	+ "		width: 70px;"
	+ "		-ms-user-select: none;"
	+ "		-moz-user-select: none;"
	+ "		-o-user-select: none;"
	+ "		-webkit-user-select: none;"
	+ "	}"
	+ "	"
	+ "	.debug-toggle > span, .fix-toggle > span { "
	+ "		position: relative;"
	+ "		top: -2px;"
	+ "	}"
	+ "	"
	+ "	.duplicate-count {"
	+ "		cursor: default;"
	+ "		display: none;"
	+ "		font-size: 11pt;"
	+ "		position: absolute;"
	+ "		left: -20px;"
	+ "		top: 0px;"
	+ "		width: 20px;"
	+ "		padding: 20px 0;"
	+ "		text-align: center;"
	+ "		background-color: rgba(0,0,0,0.5);"
	+ "	}"
	+ "	"
	+ "	.resolution {"
	+ "		margin-top: 1em;"
	+ "	}"
	+ "	"
	+ "	.resolution:before {"
	+ "		content: \"Resolution:\";"
	+ "	}"
	+ "	"
	+ "	.resolution > ol, .resolution > ul {"
	+ "		margin-top: 0;"
	+ "		margin-bottom: 0;"
	+ "	}"
	+ "	"
	+ "	/* Manage Duplicate Counter Visibility */"
	+ "	.duplicate-count {"
	+ "		display: block;"
	+ "	}"
	+ "	.duplicate-count[data-value='1'] {"
	+ "		display: none;"
	+ "	}"
	+ "</style>"

	+ "<!-- BEGIN: Status Area Extension -->"
	+ "<div id='counts'>"
	+ "	<div id='errorCount' class='error counter'>"
	+ "		<div>Error</div>"
	+ "		<div id='errorCountValue'>0</div>"
	+ "	</div>"
	+ "	<div id='warnCount' class='warn counter'>"
	+ "		<div>Warn</div>"
	+ "		<div id='warnCountValue'>0</div>"
	+ "	</div>"
	+ "	<div id='infoCount' class='info counter'>"
	+ "		<div>Info</div>"
	+ "		<div id='infoCountValue'>0</div>"
	+ "	</div>"
	+ "</div>"
	+ "<!-- END: Status Area Extension -->"

	+ "<!-- BEGIN: Tab Content -->"
	+ "<div id='messageLog' class='content'>"
	+ "	<div id='messages'>"
	+ "		<!-- Message instances will be inserted here -->"
	+ "	</div>"
	+ "</div>"
	+ "<div id='details-container' class='content'>"
	+ "	<p>"
	+ "		Investigate specific frames which triggered a message."
	+ "		Click a message in the \"Messages\" tab to populate this view. "
	+ "	</p>"
	+ "	<div id='message-details'>"
	+ "		<!-- Message details will be inserted here -->"
	+ "	</div>"
	+ "</div>"
	+ "<!-- END: Tab Content -->"

	+ "<!-- BEGIN: Templates -->"
	+ "<div class='templates'>"
	+ "	"
	+ "	<!-- BEGIN: Message Templates -->"
	+ "	<div class='error message'></div>"
	+ "	<div class='warn message'></div>"
	+ "	<div class='info message'></div>"
	+ "	<!-- END: Message Templates -->"
	+ "	"
	+ "	<!-- BEGIN: Debug Toggle Template -->"
	+ "	<label class='debug-toggle' title='Break into the script debugger the next time this message is logged.'>"
	+ "		<input type='checkbox'/>"
	+ "		<span>Debug</span>"
	+ "	</label>"
	+ "	<!-- END: Debug Toggle Template -->"
	+ "	"
	+ "	<!-- BEGIN: Message Toggle Template -->"
	+ "	<label class='fix-toggle' title='Emulate corrected behavior on refresh: '>"
	+ "		<input type='checkbox'/>"
	+ "		<span>Verify</span>"
	+ "	</label>"
	+ "	<!-- END: Message Toggle Template -->"
	+ "	"
	+ "	<!-- BEGIN: Duplicate Count Template -->"
	+ "	<label class='duplicate-count' title='Total number of messages with the same value.' data-value='1'>1</label>"
	+ "	<!-- END: Message Toggle Template -->"
	+ "	"
	+ "</div>"
	+ "<!-- END: Templates -->"

	+ "<!--"
	+ "/// modules-ui.html"
	+ "/// Compat Inspector Module Management User Interface"
	+ "-->"
	+ "<style>"
	+ "	"
	+ "	.toggle {"
	+ "		cursor: pointer;"
	+ "		padding: 20px;"
	+ "		margin: 0 20px 20px 120px;"
	+ "		background-color: #333;"
	+ "		border-left: 20px solid #09f;"
	+ "	}"
	+ "	"
	+ "	.toggle:nth-child(odd) {"
	+ "		background-color: #333;"
	+ "	}"
	+ "	"
	+ "	.toggle .name {"
	+ "		font-family: Segoe UI Semibold;"
	+ "		font-size: 11pt;"
	+ "	}"
	+ "	"
	+ "	.toggle .summary {"
	+ "		margin: 20px 0 0 0;"
	+ "	}"
	+ "	"
	+ "	.toggle {"
	+ "		transition: transform 0.1s ease;"
	+ "		-moz-transition: -moz-transform 0.1s ease;"
	+ "		-ms-transition: -ms-transform 0.1s ease;"
	+ "		-o-transition: -o-transform 0.1s ease;"
	+ "		-webkit-transition: -webkit-transform 0.1s ease;"
	+ "	}"
	+ "	"
	+ "	.toggle:active {"
	+ "		transform: scale(0.98);"
	+ "		-moz-transform: scale(0.98);"
	+ "		-ms-transform: scale(0.98);"
	+ "		-o-transform: scale(0.98);"
	+ "		-webkit-transform: scale(0.98);"
	+ "	}"
	+ "</style>"

	+ "<!-- BEGIN: Tab Content -->"
	+ "<div id='manageFixes' class='content'>"
	+ "	<p>"
	+ "		Enable verifiers for known issues."
	+ "		Verifiers are targeted shims that emulate desired behavior."
	+ "		These can be used to confirm that a given behavior is the root cause of a compat issue."
	+ "	</p>"
	+ "	<p>"
	+ "		<em>Check the box next to a verifier to enable it, then refresh the current page.</em>"
	+ "	</p>"
	+ "	<!-- Fix instances will be inserted here -->"
	+ "</div>"
	+ "<div id='manageTests' class='content'>"
	+ "	<p>"
	+ "		Manage which tests are enabled."
	+ "		Tests monitor page interactions and report potential issues."
	+ "	</p>"
	+ "	<!-- Test instances will be inserted here -->"
	+ "</div>"
	+ "<!-- END: Tab Content -->"

	+ "<!-- BEGIN: Templates -->"
	+ "<div class='templates'>"
	+ "	"
	+ "	<!-- BEGIN: Toggle Template -->"
	+ "	<label class='toggle' title='Click to enable/disable this item'>"
	+ "		<input type='checkbox'/>"
	+ "		<span class='name'>"
	+ "			Item Name"
	+ "		</span>"
	+ "		<div class='summary'>"
	+ "			This is a summary of the item that can be toggled."
	+ "		</div>"
	+ "	</label>"
	+ "	<!-- END: Toggle Template -->"
	+ "	"
	+ "</div>"
	+ "<!-- END: Templates -->"

	+ "</body></html>";

if (inspector.init) inspector.init();