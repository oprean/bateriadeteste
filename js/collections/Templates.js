define([
  'jquery',
  'underscore',
  'backbone',
  'models/Template'
], function($, _, Backbone, Template){
  var Templates = Backbone.Collection.extend({
  	url: 'api/template', 
  	model: Template,
  });

  return Templates;
});