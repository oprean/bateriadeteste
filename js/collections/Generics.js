define([
  'jquery',
  'underscore',
  'backbone',
  'models/Generic'
], function($, _, Backbone, Generic){
  var Generics = Backbone.Collection.extend({
    model: Generic,
  });

  return Generics;
});