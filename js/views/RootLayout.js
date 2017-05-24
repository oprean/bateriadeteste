define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'text!templates/common/root-layout.html',
  'views/common/HeaderView',
  'views/common/FooterView',
  'components/Constants',
  'components/Utils'
], function($, _, Backbone, Marionette, rootLayoutTpl, HeaderView, FooterView, Constants, Utils){
  var RootLayout = Backbone.Marionette.LayoutView.extend({
	template : _.template(rootLayoutTpl),
	el: 'body',
	regions : {
		header : '#header-container',
		main : '#main-container',
		footer : '#footer-container',
		modals : {
			el:'#modals-container',
			regionClass: Backbone.Marionette.Modals
		}
	},
	
	events : {
	},
	
	initialize : function(options) {
		this.render();
		this.showChildView('header', new HeaderView());
		this.showChildView('footer', new FooterView());
	},
	

  });

  return RootLayout;
});