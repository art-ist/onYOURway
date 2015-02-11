define([
  'services/tell'
], function (tell) {
  var storage = {
    //methods
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
    tell.log("loaded " + value + " for '" + key + "'", 'localStorage', {'key': key, 'value': value, 'storeValue': storeValue} );
    callback(value);

  } //get

  //pass a key for retrieval and the value to store
  function set(key, value) {

    //WebStorage/localStorage
    var storeValue = JSON.stringify(value);
    window.localStorage.setItem(key, storeValue);
    tell.log("saved " + value + " as '" + key + "'", 'localStorage', { 'key': key, 'value': value, 'storeValue': storeValue });

  } //set

  function remove(key) {

    //WebStorage/localStorage
    window.localStorage.removeItem(key);
    tell.log("removed '" + key + "'", 'localStorage');

  }

  function clear() {

    //WebStorage/localStorage
    window.localStorage.clear();
    tell.log("ALL ITEMS REMOVED", 'localStorage');

  }

  return storage;
});
