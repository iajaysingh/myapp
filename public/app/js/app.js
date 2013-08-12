// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'controllers/e_note'
], function($, _, Backbone, ENoteController){
  var initialize = function(){
    ENoteController.initialize();
  };
  return {
    initialize: initialize
  };
});
