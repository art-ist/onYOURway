define([
    'services/map/settings'
], function (settings) {

  var vm = {
    self: this,

    toggleTagSelection: function() {
        settings.showTagSelection(!settings.showTagSelection());
    }
  };
  return vm;

});
