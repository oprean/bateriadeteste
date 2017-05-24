define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'views/common/SideMenuView',
  'views/users/UsersLayout',
  'views/groups/GroupsLayout',
  'views/quizzes/QuizzesLayout',
  'views/permissions/PermissionsLayout',
  'text!templates/admin/admin-layout.html',
], function($, _, Backbone, Marionette, SideMenuView, UsersLayout, GroupsLayout, QuizzesLayout, PermissionsLayout, adminLayoutTpl){
  var AdminLayout = Backbone.Marionette.LayoutView.extend({
	template : _.template(adminLayoutTpl),
	regions : {
		menu : '.side-menu-container',
		main : '.admin-main-container',
	},
	
	initialize : function(options) {
		this.sideMenuView = new SideMenuView(options);
		switch(options.section) {
			case 'users':
				this.mainView = new UsersLayout();			
				break;
			case 'groups':
				this.mainView = new GroupsLayout();			
				break;
			case 'permissions':
				this.mainView = new PermissionsLayout();			
				break;
			case 'quizzes':
				this.mainView = new QuizzesLayout();			
				break;
			default:
				this.mainView = new UsersLayout();
				break;
		}
	},
	
	onBeforeShow : function() {
		this.showChildView('menu', this.sideMenuView);
		this.showChildView('main', this.mainView);
	},
  });

  return AdminLayout;
});