define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/User',
  'collections/Users',
  'views/users/UserFormView',
  'text!templates/users/users-layout.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, User, Users, UserFormView, usersTpl, Utils, Constants, vent){
	var UsersLayout = Backbone.Marionette.LayoutView.extend({
		template : _.template(usersTpl),
		regions : {
			grid : '.users-grid-body-container',
			details : '.details',
			paginator : '.paginator'
		},
		
		initialize : function(options) {
		    vent.trigger('router.page.info.update',{bcs:[{href:'#users', text:qtr('users')}]});
			var self = this;
			this.users = new Users();
			
			this.users.fetch({
				success: function(collection){
					self.initUsersGrid(collection);  
				}
			});
			
			this.listenTo(vent, 'admin.users.grid.refresh', function(){
				self.users.fetch({
					success: function(collection){
						self.initUsersGrid(collection);
					}
				});
			});
		},
		
		events : {
			'click .btn-add': 'addUser'
		},
		
		onAttach: function() {
            var table = this.$('table.backgrid');
            table.floatThead({
                //scrollContainer: function(table){
                responsiveContainer: function(table){
                    return table.closest('.users-grid-body-container');
                }
            });  
		},
		
		addUser : function() {
			this.model = new User();
			var userView = new UserFormView({model:this.model});
			vent.trigger('showModal', userView);
		},
		
		initUsersGrid: function(users) {
			var self = this;
			var UserRow = Backgrid.Row.extend({
			  events: {
			    click: 'details',
			  },
			  details: function() {
			    app.router.navigate('/user/'+this.model.id, {trigger: true});
			  }
			});
					
			Backgrid.ActionsCell = Backgrid.Cell.extend({
			  className: "actions-cell",
			  events : {
			  	'click .del-user' : 'delete',
			  	'click .edit-user' : 'edit'
			  },
			  
			  delete : function(e) {
			    e.stopPropagation();
				if (confirm('Are you sure?')) {
			  		this.model.destroy();					
				}
			  },
			  	  
			  edit : function(e) {
			    e.stopPropagation();
				var userView = new UserFormView({model:this.model});
				vent.trigger('showModal', userView);
			  },
			  
			  render : function() {
                var html = '<div class="text-center">';
                var perms = this.model.get('perms');
                
                if (appUser.permCheck(perms,'edit'))
                    html += ' <button type="button" title="Edit user" class="edit-user btn btn-xs btn-success"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>'; 
                if (appUser.permCheck(perms,'delete'))
                    html += ' <button type="button" title="Delete user" class="del-user btn btn-xs btn-danger"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button> '; 
                html += '</div>'; 
			  	
			  	this.$el.html(html);
			  	
			  	return this;
			  }			
			});
						
			var columns = [
			  {
			    name: "username",
			    label: i18n.t("username"),
			    editable: false,
			    sortable: false,
			    cell: "string",
			  },
              {
                name: "firstname",
                label: i18n.t("firstname"),
                editable: false,
                sortable: false,
                cell: "string",
              },
              {
                name: "lastname",
                label: i18n.t("lastname"),
                editable: false,
                sortable: false,
                cell: "string",
              },
			  {
			    name: "email",
			    label: "E-Mail",
			    editable: false,
			    sortable: false,
			    cell: "string",
			  },
              {
                name: "type",
                label: i18n.t("type"),
                editable: false,
                sortable: false,
                cell: "string",
              },
			  {
			    name: "actions",
			    label: "",
			    editable: false,
			    sortable: false,
			    cell: "actions",
			  },
			];
			
			var backgridView = new Backgrid.Grid({
			  className: 'backgrid items table table-hover table-condensed',
			  row: UserRow,
			  columns: columns,
			  collection: users,
			  emptyText: "A man without history is a tree without roots.",
			});
			
            var filter = new Backgrid.Extension.ClientSideFilter({
              collection: users,
              fields: ['username', 'email', 'firstname', 'lastname']
            });
			
			this.$('.users-grid-body-container').height($(document).height()-250);
			
			this.showChildView('grid', backgridView);
            this.$('.users-grid-filter-container').html(filter.render().el);
		},
		
		templateHelpers : function() {
		},
		
	});
	 
	return UsersLayout;
});