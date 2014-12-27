/* _tell: logs messages of events 
   writes them to console for debugging,
   toasts them and
   stores them during current user session in an in-memory log 
 */
define([
	'durandal/system',
	'durandal/app',
	'plugins/dialog'
],
function (system, durandal, dialog) {
	var _timer = {};

	var tell = {

		//log
		//0: turn off logging
		//1: log errors
		//2: log warnings
		//3: log success 
		//4: log info
		//5: log trace
		//6: log process (start/end)
		//7: log debug
		traceLevel: 2,
		traceTargets: [
    		{ write: writeToConsole/*, level: 7*/ }
		],

		//current
		processes: [],

		//methods
		initialize: initialize,
		error: error,
		warning: warning,
		success: success,
		info: info,
		log: debug,
		debug: debug,
		trace: trace,
		start: start,
		done: done,
		//raw
		channel: channel

	};
	return tell;

	function _tell(channel, severity, message, title, caller, logInfos, buttonsOrData) {

		//tell log (iterating traceTargets)
		for (var i = 0; i < tell.traceTargets.length; i++) {
			var target = tell.traceTargets[i];
			var traceLevel = target.level || tell.traceLevel;
			if (severity === 'error' && traceLevel >= 1)
				target.write(caller, severity, message, title, logInfos);
			else if (severity === 'warning' && traceLevel >= 2)
				target.write(caller, severity, message, title, logInfos);
			else if (severity === 'success' && traceLevel >= 3)
				target.write(caller, severity, message, title, logInfos);
			else if (	(severity === 'info' && traceLevel >= 4)
					 || (severity === 'question' && traceLevel >= 4)
					)
				target.write(caller, severity, message, title, logInfos);
			else if (   (severity === 'trace' && traceLevel >= 5)
					 || (severity === 'start' && traceLevel >= 6)
					 || (severity === 'done'  && traceLevel >= 6)
					 || (severity === 'debug' && traceLevel >= 7)
					)
				target.write(caller, severity, message, title, logInfos);
    	}

		//tell user
		switch (channel) {
			case 'toast':
				toast(severity, message);
				return null;
		    case 'modal':
		        return modal(severity, title, buttonsOrData);
		    case 'messageBox':
		        return messageBox(severity, message, title, buttonsOrData);
			default:
				return null;
		}
	} //_tell

	function channel(channel, severity, message, title, logInfos, buttonsOrData) {
		//get caller
		var caller = '';
		try {
			if (channel.caller) caller = channel.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell(channel, severity, message, title, caller, logInfos, buttonsOrData);
	}
	
	function error(message, title, logInfos, processName) {
		//get caller
		var caller = null;
		try {
			if (error.caller) caller = error.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		if (processName) {
			done(processName);
		}
		return _tell('toast', 'error', message, title, caller, logInfos);
	}

	function warning(message, title, logInfos) {
		//get caller
		var caller = '';
		try {
			if (warning.caller) caller = warning.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell('toast', 'warning', message, title, caller, logInfos);
	}

	function success(message, title, logInfos) {
		//get caller
		var caller = '';
		try {
			if (success.caller) caller = success.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell('toast', 'success', message, title, caller, logInfos);
	}

	function info(message, title, logInfos) {
		//get caller
		var caller = '';
		try {
			if (info.caller) caller = info.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell('toast', 'info', message, title, caller, logInfos);
	}

	function trace(message, title, logInfos) {
		//get caller
		var caller = '';
		try {
			if (trace.caller) caller = trace.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell('log', 'trace', message, title, caller, logInfos);
	}

	function debug(message, title, logInfos) {
		//get caller
		var caller = '';
		try {
			if (debug.caller) caller = debug.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		return _tell('log', 'debug', message, title, caller, logInfos);
	}

	function start(name, logInfos) {
		var proc = ko.utils.unwrapObservable(tell.processes);
		var p = null;
		//process already in the list?
		for (var i = 0; i < proc.length; i++) {
			if (proc[i] === name) {
				p = proc[i];
				break;
			}
		}
		//else add
		if (!p) {
			proc.push({ name: name });
			if (ko.isObservable(tell.processes)) tell.processes.valueHasMutated();
		}

		//get caller
		var caller = ''; 
		try {
			if (start.caller) caller = start.caller.name;
			else if (arguments.callee.caller) caller = arguments.callee.caller.name;
		} catch (ex) { }

		//log
		return _tell('log', 'start', name + ' starting', 'process', caller, logInfos);
	}

	function done(name) {
		var proc = ko.utils.unwrapObservable(tell.processes);
		for (var i = 0; i < proc.length; i++) {
			if (proc[i].name === name) {
				proc.splice(i, 1);
				if (ko.isObservable(tell.processes)) tell.processes.valueHasMutated();
				break;
			}
		}

		//log
		return _tell('log', 'done', name + ' done', 'process', null, null);
	}

	//#region channels

	function toast(severity, message, title) {
		switch (severity) {
			case 'error':
				toastr.error(message, title);
				break;
			case 'warning':
				toastr.warning(message, title);
				break;
			case 'success':
				toastr.success(message, title);
				break;
			default:
				toastr.info(message, title);
				break;
		}
	} //toast

	function messageBox(severity, message, title, buttons) {
		//see: http://durandaljs.com/documentation/Showing-Message-Boxes-And-Modals.html

		//TODO: if running on phonegap use their tell api for native notifications instead
		//http://docs.phonegap.com/en/2.4.0/cordova_notification_notification.md.html#tell
		switch (severity) {
			case 'error':
			    return durandal.showMessage(message, title, buttons || ['Ok'], true, { "class": "error" });
			case 'warning':
			    return durandal.showMessage(message, title, buttons || ['Ok'], true, { "class": "warning" });
			case 'success':
			    return durandal.showMessage(message, title, buttons || ['Ok'], true, { "class": "success" });
			case 'info':
			    return durandal.showMessage(message, title, buttons || ['Ok'], true, { "class": "info" });
			default:
			    return durandal.showMessage(message, title, buttons || ['Ok'], true);
		}
	} //messageBox

	function modal(severity, view, activationData) {
	    switch (severity) {
	        case 'error':
	            return durandal.showDialog(view, activationData);
	        case 'warning':
	            return durandal.showDialog(view, activationData);
	        case 'success':
	            return durandal.showDialog(view, activationData);
	        case 'info':
	            return durandal.showDialog(view, activationData);
	        default:
	            return durandal.showDialog(view, activationData);
	    }
	} //modal

	//#endregion channels

	//#region traceWriters

	function writeToConsole(caller, severity, message, title, logInfos) {
		//build message
		if (caller && title)
			message = '[' + title + ' | ' + caller + '] ' + message;
		else if (caller)
			message = '[' + caller + '] ' + message;
		else if (title)
			message = '[' + title + '] ' + message;
		//log
		switch (severity) {
			case 'error':
				console.error(message, logInfos);
				break;
			case 'warning':
				console.warn(message, logInfos);
				break;
			default:
				console.log(message, logInfos);
				break;
		}
	} //traceConsole

	//#endregion traceWriters

	//#region timer (not implemented/integrated)

	//_tell.startTimer('calcNextStep');
	//_tell.endTimer('draw', false);
	//_tell.measureTimer('draw', 200);

	function startTimer(name) {
		if (_time) {
			var timer = _timer[name];
			if (!timer) {
				_timer[name] = {
					start: -1,
					end: -1,
					sum: 0,
					count: 0
				};
				timer = _timer[name];
			}
			timer.count++;
			timer.start = performance.now();
		}
	};
	function endTimer(name, log) {
		if (_time) {
			var timer = _timer[name];
			if (!timer) {
				console.error("no timer with name started");
			} else {
				timer.end = performance.now();
				timer.sum += timer.end - timer.start;
				if (log) {
					console.log('[ ' + _name + ' | Elapsed time from Timer \'' + name + '\' ] ' + (timer.end - timer.start) + ' ms');
				}
			}
		}
	};
	function measureTimer(name, intervall) {
		if (_time) {
			var timer = _timer[name];
			if (!timer) {
				console.error("no timer with name started");
			} else {
				if (intervall) {
					if (!(timer.count % intervall)) {
						console.log('[ ' + _name + ' | Mittelwert des Timers \'' + name + '\' mit ' + timer.count + ' Messungen] ' + timer.sum / timer.count + ' ms');
					}
				} else {
					console.log('[ ' + _name + ' | Mittelwert des Timers \'' + name + '\' mit ' + timer.count + ' Messungen] ' + timer.sum / timer.count + ' ms');
				}
			}
			return timer.sum / timer.count;
		}
	};
	function clearTimer(name) {
		if (_timer[name]) {
			_timer[name] = null;
		}
	};

	//#endregion timer

	function initialize() {

		//#region configure toastr

		toastr.options = { //configure toastr (see: http://codeseven.github.io/toastr/demo.html)	
			positionClass: 'toast-top-left',
			toastClass: 'alert',
			iconClasses: {
				error: 'alert-danger',
				info: 'alert-info',
				success: 'alert-success',
				warning: 'alert-warning'
			},
			titleClass: 'none',
			messageClass: 'none'
		};

		//#endregion configure toastr

		//#region configure modal plugin

		//bootstrap 3.1.0 modal dialog context for Durandal
		dialog.addContext('bootstrapDialog', {
			blockoutOpacity: .2,
			removeDelay: 300,

			/**
			 * In this function, you are expected to add a DOM element to the tree which will serve as the "host" 
			 * for the modal's composed view. You must add a property called host to the modalWindow object which 
			 * references the dom element. It is this host which is passed to the composition module.
			 * @method addHost
			 * @param {Dialog} theDialog The dialog model.
			 */
			addHost: function (theDialog) {
				var body = $('body');
				//Add base bootstrap modal
				var host = $('<div class="modal fade" id="bootstrapModal" tabindex="-1" role="dialog" aria-labelledby="bootstrapModal" aria-hidden="true"></div>')
					.appendTo(body);

				//set the Dialog.host property
				theDialog.host = host.get(0);
			},

			/**
			 * This function is expected to remove any DOM machinery associated with the specified dialog and 
			 * do any other necessary cleanup.
			 * @method removeHost
			 * @param {Dialog} theDialog The dialog model.
			 */
			removeHost: function (theDialog) {
				//Call bootstrap to hide the modal
				$('#bootstrapModal').modal('hide');
				//remove the modal class from the body
				$(document.body).removeClass('modal-open');

				//Using Q but this could be a simple timeout
				//Remove the DOM element for the modal
				//Noticed some strange effects if delay was shorter that 300ms
				Q.delay(this.removeDelay).then(function () {
					ko.removeNode(theDialog.host);
				});
			},

			attached: function (view) {
			},

			/**
			 * This function is called after the modal is fully composed into the DOM, allowing your implementation to 
			 * do any final modifications, such as positioning or animation. You can obtain the original dialog object by 
			 * using `getDialog` on context.model.
			 * @method compositionComplete
			 * @param {DOMElement} child The dialog view.
			 * @param {DOMElement} parent The parent view.
			 * @param {object} context The composition context.
			 */
			compositionComplete: function (child, parent, context) {
				var theDialog = dialog.getDialog(context.model);

				//show the modal
				$('#bootstrapModal').modal('show');
				//Handle removing the DOM elements when the dialog is closed by clicking in modal-backdrop 
				$('#bootstrapModal').on('hidden.bs.modal', function (e) {
					theDialog.close();
				});
			}
		});


		//#endregion configure modal plugin


	}

});
