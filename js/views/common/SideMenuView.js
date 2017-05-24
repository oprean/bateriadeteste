define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'text!templates/common/side-menu.html',
  'globals'
], function($, _, Backbone, Marionette, Settings, headerTpl, globals){
	var SideMenuView = Backbone.Marionette.ItemView.extend({
		template : _.template(headerTpl),
		initialize : function(options) {
			this.active = options.section;
			this.items = [
				{
					label: 'Users',
					href: '#admin/users',
					name: 'users'
				},
				{
					label: 'Groups',
					href: '#admin/groups',
					name: 'groups'
				},
				{
					label: 'Permissions',
					href: '#admin/permissions',
					name: 'permissions'
				},
				{
					label: 'Quizzes',
					href: '#admin/quizzes',
					name: 'quizzes'
				},
			];			
		},
		
		events: {
			'click .side-menu-item' : 'sideMenuClick'
		},
		
		sideMenuClick: function(e) {
			this.$('.side-menu-item').parent().removeClass('active');
			$(e.target).parent().addClass('active');
		},
		
		templateHelpers: function() {
			return {
				user: globals.user,
				active: this.active,
				items: this.items
			};
		}
	});
	 
	return SideMenuView;
});