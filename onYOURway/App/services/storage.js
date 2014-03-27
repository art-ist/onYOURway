define([
  'services/logger'
], function (logger) {
  var storage = {
    get: get,
    set: set,
    remove: remove,
    clear: clear,
    //aliases:
    load: get, 
    save: set,
    reset: clear
  }; //storage

  var store = null;

  //pass a key and callback is called with the retrieved value as parameter
  function get(key, callback) {
    //WebStorage/localStorage
    var storeValue = window.localStorage.getItem(key);
    var value = JSON.parse(storeValue);
    logger.log("loaded " + value + " for '" + key + "'", '_storage', {'key': key, 'value': value, 'storeValue': storeValue} );
    callback(value);

    ////Lawnchair
    //if (!store) {
    //  store = Lawnchair(function () {
    //    logger.log('storage openened', 'storage', this);
    //  });
    //}
    ////get value
    //store.get(key, function onLoaded(data) {
    //  var value = data ? data.value : null;
    //  logger.log(value + ' received for "' + key + '"', '_storage', data);
    //  callback(value);
    //});

  } //get

  //pass a key for retrieval and the value to store
  function set(key, value) {
    //WebStorage/localStorage
    var storeValue = JSON.stringify(value);
    window.localStorage.setItem(key, storeValue);
    logger.log("saved " + value + " as '" + key + "'", '_storage', {'key': key, 'value': value, 'storeValue': storeValue} );

    ////Lawnchair
    //if (!store) {
    //  //open store
    //  store = Lawnchair(function () {
    //    logger.log('storage openened', 'storage', this);
    //  });
    //}
    ////save value
    //store.save({ 'key': key, 'value': value }, function onSaved() {
    //  logger.log(value + ' saved as "' + key + '"', '_storage', value);
    //});
  } //set

  function remove(key) {
    //WebStorage/localStorage
    window.localStorage.removeItem(key);
    logger.log("removed '" + key + "'", '_storage');

    ////Lawnchair
    ////TODO
  }

  function clear() {
    //WebStorage/localStorage
    window.localStorage.clear();
    logger.log("ALL ITEMS REMOVED", '_storage');

    ////Lawnchair
    ////TODO: implement store.nuke();
  }

  return storage;
});
