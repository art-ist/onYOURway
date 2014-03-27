/// <reference path="../../Scripts/toastr.js" />

/* logger: logs messages of events 
   writes them to console for debugging,
   toasts them and
   stores them during current user session in an in-memory log 
 */
define(['durandal/system'],
    function (system) {

      //see: http://docs.phonegap.com/en/2.4.0/cordova_notification_notification.md.html#Notification

      var sessionLog = [];
      var logger = {
        //config
        traceLevel: 0, //0: turn off logging, 1: store in session log only, 2: write to console

        //methods
        log: log,
        logWarning: logWarning,
        logError: logError,
        warn: warn,
        info: info,
        success: success,
        error: error,

        //log
        sessionLog: sessionLog
      };
      return logger;

      function log(message, source, data) { _logIt(message, 'log', data, source, false, null); }
      function logWarning(message, source, data) { _logIt(message, 'warning', data, source, false, sessionLog); }
      function logError(message, source, data) { _logIt(message, 'error', data, source, false, sessionLog); }
      function warn(message, source, data) { _logIt(message, 'warning', data, source, true, sessionLog); }
      function info(message, source, data) { _logIt(message, 'info', data, source, true, sessionLog); }
      function success(message, source, data) { _logIt(message, 'success', data, source, true, sessionLog); }
      function error(message, source, data) { _logIt(message, 'error', data, source, true, sessionLog); }

      function _logIt(message, type, data, source, showToast, sessionLog) {
        type = type || "info";
        source = source ? source + ' ― ' : ''; //this is no - or JS would only display NaN for source ;-)

        //log to browser console using durandal logging service (can be disabled im main.js by setting system.debug(false);)
        if (logger.traceLevel >= 2) {
          if (data) {
            system.log(source, message, data);
          } else {
            system.log(source, message);
          }
        }

        if (showToast) { //toast to User
          switch (type) {
            case 'success':
              toastr.success(message);
              break;
            case 'warning':
              toastr.warning(message);
              break;
            case 'error':
              toastr.error(message);
              break;
            default:
              toastr.info(message);
              break;
          }
        }

        if (logger.traceLevel >= 1 && sessionLog) { //store in sessionLog
          var logEntry = {
            time: new Date().toLocaleTimeString(),
            message: message,
            type: type,
            source: source
          };
          sessionLog.push(logEntry);
        }

      }

    });
