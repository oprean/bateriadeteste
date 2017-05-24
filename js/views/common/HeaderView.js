define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'components/Utils',
  'text!templates/common/header.html',
  'components/Constants',
  'globals'
], function($, _, Backbone, Marionette, Settings, Utils, headerTpl, Constants, globals){
	var HeaderView = Backbone.Marionette.ItemView.extend({
		template : _.template(headerTpl),
		initialize : function(options) {
		    this.menu = [];
		    this.menu.push({href: '#', text:i18n.t('home')});
		    if (appUser.hasPerm('quizzes.view')) this.menu.push({href: '#quizzes', text:i18n.t('quizzes')});
            if (appUser.hasPerm('users.view')) this.menu.push({href: '#users', text:i18n.t('users')});
            if (appUser.hasPerm('groups.view')) this.menu.push({href: '#groups', text:i18n.t('groups')});
            //if (appUser.hasPerm('statistics.view')) this.menu.push({href: '#statistics', text:i18n.t('Statistics')});
            if (appUser.hasPerm('permissions.view')) this.menu.push({href: '#permissions', text:i18n.t('permissions')});
            //if (appUser.isAdmin) this.menu.push({href: '#admin', text:i18n.t('Admin')});
		},
		
		events: {
			'click .top-menu-item' : 'topMenuClick',
			'click .navbar-brand' : 'clearActive'
		},
		
		topMenuClick: function(e) {
			this.$('.top-menu-item').parent().removeClass('active');
			$(e.target).parent().addClass('active');
		},
		
		clearActive : function() {
			this.$('.top-menu-item').parent().removeClass('active');
		},
		
		templateHelpers: function() {
			return {
				menuItems: this.menu
			};
		}
	});
	 
	return HeaderView;
});