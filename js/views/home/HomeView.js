define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Quizzes',
  'text!templates/home/home-view.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Quizzes, homeTpl, Constants, Utils, vent, globals){
  var HomeView = Backbone.Marionette.ItemView.extend({
	template : _.template(homeTpl),
	events : {
		//'click .btn-primary' : 'alert'
	},
	
	alert : function() {
		alertify.alert('Ready!');
		alertify.notify('sample', 'success', 5, function(){  console.log('dismissed'); });
	},
	
	initialize : function(options) {
		var self = this;
		this.quizzes = new Quizzes();
		this.quizzes.fetch({
		    async:false,
			success: function() {
			    console.log('hw');
				self.render();
			}
		});
	},
	templateHelpers: function() {
		return {
		    quizzes: this.quizzes
		};
	}
	
  });

  return HomeView;
});