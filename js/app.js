define([
	'jquery',
	'underscore',
	'backbone',
	'backbone.marionette',
    'models/AppUser',
	'collections/Settings',
	'views/RootLayout',
	'components/Router',
	'components/Utils',
	'components/Constants',
	'i18n!nls/labels',
	'globals',
	'lib/alertify.min'
], function( $, _, Backbone, Marionette, AppUser, Settings, RootLayout, Router, Utils, Constants, labels, globals, alertify) {
	var App = Backbone.Marionette.Application.extend({
		initialize: function() {
			$.ajaxSetup({
			    cache: false,
                beforeSend:function(){
                    $("#loading").show();
                },
                complete:function(){
                    $("#loading").hide();
                }
            });
			Settings.fetch({async:false});
			
			console.log(labels);
			window.i18n = new Polyglot({phrases: labels});
			window.qtr = Utils.t;
 			window.alertify = alertify; 
			if (globals.user) {
                window.appUser = new AppUser();
			}
					
			this.env = Utils.bootstrapEnv();
			this.router = new Router();
			this.locale = globals.language || window.navigator.userLanguage || window.navigator.language;
			this.locale = this.locale.indexOf('ro')==0?'ro':'en';
			console.log('lang: ' + this.locale);
			// start rendering
			this.rootLayout = new RootLayout();		
		},
		
		onStart: function() {

		}
	});
	
	return App;
});