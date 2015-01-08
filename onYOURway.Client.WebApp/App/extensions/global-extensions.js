//Global Extensions

//Extension for moment to understand MS DateTime (actually time only) format
moment.fromPT = function (time) {
	if (!time) return null;
	var h = 0, m = 0, s = 0;
	var parts = time.replace(/PT/, '');
	if (parts.indexOf("H") > -1) {
		parts = parts.split("H");
		h = parseInt(parts[0], 10);
		parts = parts[1];
	}
	if (parts.indexOf("M") > -1) {
		parts = parts.split("M");
		m = parseInt(parts[0], 10);
		parts = parts[1];
	}
	if (parts.indexOf("S") > -1) {
		parts = parts.split("S");
		s = parseInt(parts[0], 10);
	}
	return moment().year(0).month(0).date(0).hour(h).minute(m).second(s);
};


//global method to chek js object type
var typeOf = (function (global) {
	var cache = {};
	return function (obj) {
		var key;
		return obj === null ? 'null' // null
				: obj === global ? 'global' // window in browser or global in nodejs
				: (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
				: obj.nodeType ? 'object' // DOM element
				: cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
				|| (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
	};
}(this));


String.prototype.startsWith = function (prefix) {
	return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function (suffix) {
	return this.match(suffix + "$") == suffix;
};

String.prototype.lTrim = function () {
	return this.replace(/(^\s*)/g, "");
};

String.prototype.rTrim = function (str) {
	return this.replace(/(\s*$)/g, "");
};