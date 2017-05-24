define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
    'text!templates/home/admin-home-view.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, homeTpl, Constants, Utils, vent, globals){
  var NormalHomeView = Backbone.Marionette.ItemView.extend({
	template : _.template(homeTpl),
	events : {
	},
	
	initialize : function(options) {
        console.log('admin home');
	},
	
  });

  return NormalHomeView;
});