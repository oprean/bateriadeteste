define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'text!templates/statics/contact.html',
  'text!templates/statics/about.html',
], function($, _, Backbone, Marionette, contactTpl, aboutTpl){
	var StaticView = Backbone.Marionette.ItemView.extend({
		initialize : function(options) {
			var template;
			switch (options.tpl) {
				case 'about':
					template = _.template(aboutTpl);
					break;
				case 'contact':
					template = _.template(contactTpl);
					break;
				default:
			}
			this.template = template; 
			this.render();
		}
	});
	 
	return StaticView;
});