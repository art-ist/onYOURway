/// <reference path="../../Scripts/jsts.js" />
/// <reference path="../../Scripts/leaflet-0.5.1.js" />
/// <reference path="../../Scripts/knockout-3.3.0.js" />

define([
    'services/tell',
    'services/taxonomy'
], function (tell, taxonomy) {

    //create global viewModel
    var translation = {
        lang: ko.observable(navigator.language.substring(0,2)),
        langs: [
            { id: 'de', name: 'Deutsch' },
            { id: 'en', name: 'English' },
            { id: 'fr', name: 'Français' },
            { id: 'it', name: 'Italiano' },
            { id: 'es', name: 'Español' },
        ],
        loadMessages: loadMessages,
        setLang: setLang,

        msg: null /* messages (translations texts) - will be initialized on load */,
        getMsg: getMessage,
        tryMsg: getMessage, //tryGetMessage,
    };
    return translation;

    function loadMessages() {
        var readManager = new breeze.EntityManager({
            dataService: new breeze.DataService({
                serviceName: config.host + '/locate'
                , hasServerMetadata: false  // never ask the server for metadata (we don not want this manager to mengle json data into any metadata based object types)
            }),
        });
        var q = new breeze.EntityQuery().from('Messages');
        if (translation.lang()) {
            q = q.withParameters({ Locale: translation.lang() });
        }
        tell.start('App - Loading Messages');
        return readManager.executeQuery(q)
            .then(function (data) {
                translation.msg = data.results[0];
                tell.done('App - Loading Messages');
                $(translation).trigger('messagesLoaded');
                // configure breeze client side validation messages (used as fallback by the breezeValidation-bindingHandler, if no error.validation[key] message is found)
                if (translation.msg && translation.msg.error && translation.msg.error.breeze && breeze && breeze.Validator && breeze.Validator.messageTemplates) {
                    $.each(translation.msg.error.breeze, function (key, val) {
                        if (key && val && key.indexOf('$') !== 0) {
                            breeze.Validator.messageTemplates[key] = val;
                        }
                    });
                }
            })
            .fail(function (e) {
                tell.error('Loading messages failed', 'App', e, 'App - Loading Messages');
            });
        ;
    }

    //helper function to drill down into an object hierarchy, returning null if any property doesnt exist
    function drill(obj, key) {
        if (!obj) {
            return null;
        } else {
            var val = obj[key];
            if (val) {
                return val;
            } else {
                var idx = key.indexOf('.');
                return idx < 0 ? null : drill(obj[key.substr(0, idx)], key.substr(idx + 1));
            }
        }
    }

    //helper function to format a message "{0} + {1} = {2}" by inserting the provided variables (1,2,3): "1 + 2 = 3"
    function formatMessage(message, replacements) {
        return message && message.replace(/\{(\d+)\}/g, function () {
                return replacements[arguments[1]];
            });
    }

    ////return a translated message by key
    ////the parameter keys can eiter be a string or and array of two strings
    ////if no message for this key found, returns ???keys???
    //function getMessage(keys, variableValues, obj) {
    //    return tryGetMessage(keys, variableValues, obj) || ('???' + keys + '???');
    //}

    //return a translated message by key
    //the parameter keys can eiter be a string or an array of two strings or an array of two strings and another array of variableValues
    //the parameter variableValues is an array of all required variable values for this messages placeholders ({0} ... {9})
    //if no message for this key found, returns null
    function getMessage(keys, variableValues, obj) {
        var result = null;
        if (typeof keys === 'string') {
            result = variableValues
                ? formatMessage(drill(obj || translation.msg, keys), variableValues)
                : drill(obj || translation.msg, keys);
        } else {
            result = (variableValues || keys[2])
                ? formatMessage(drill(drillobj || (translation.msg, keys[0]), keys[1]), variableValues || keys[2])
                : drill(drill(obj || translation.msg, keys[0]), keys[1]);
        }
        //log message if key not found
        if (!result) {
            tell.log("translation.getMessage could not find message for key '" + keys + "'", 'translation localization');
        }
        return result;
    }

    //set translation language (causing message reload)
    function setLang(langId) {
        tell.log('setting lang to ' + langId);
        translation.lang(langId);

        loadMessages();
        taxonomy.loadTaxonomy(translation.lang);

        return false;
    }


});

