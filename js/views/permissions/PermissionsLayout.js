define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Permission',
  'collections/Permissions',
  'views/permissions/PermissionFormView',
  'views/permissions/PermissionAssignFormView',
  'views/permissions/PermissionDataView',
  'text!templates/permissions/permissions-layout.html',
  'text!templates/permissions/user-row.html',
  'text!templates/permissions/assigned-perms-row.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Permission, Permissions, PermissionFormView, PermissionAssignFormView, PermissionDataView, permissionTpl, userRowTpl, assignedPermsRowTpl, Utils, Constants, vent){
	var PermissionsLayout = Backbone.Marionette.LayoutView.extend({
		template : _.template(permissionTpl),
		regions : {
			assignments : '.assignments-container',
			operations: '.operations-permissions-container',
			groups: '.groups-permissions-container',
			quizzes: '.quizzes-permissions-container',
			users: '.users-permissions-container',
			details: '.permission-details-container'
		},
		
		initialize : function(options) {
            vent.trigger('router.page.info.update',{bcs:[{href:'#permissions', text:'Permissions'}]});
			var self = this;
			this.permissions = new Permissions();
			this.assignments = new Permissions();
			this.assignments.url = 'api/permission/assignments';
			this.assignments.fetch({
                success: function(collection){
                    self.showChildView('assignments', self.renderAssignmentGrid());
                    self.permissions.fetch({
                        data: { include: 'assocobj',destinct: 'data' },
                        traditional: true,
                        success: function(collection){
                            self.renderGrids();
                        }
                    });
                }
			});
            
			this.listenTo(vent, 'admin.permissions.grid.refresh', function(){
				self.permissions.fetch({
					success: function(collection){
						self.renderGrids();
					}
				});
			});
		},
		
		events : {
			'click .btn-add': 'addPermission'
		},
		
		addPermission : function() {
			this.model = new Permission({type:Constants.OPERATION_TYPE});
			var permissionView = new PermissionFormView({model:this.model});
			vent.trigger('showModal', permissionView);
		},
		
		renderGrids: function() {
            this.showChildView('operations', this.renderPermissionGrid(Constants.OPERATION_TYPE));
            this.showChildView('groups', this.renderPermissionGrid(Constants.GROUP_TYPE));
            this.showChildView('quizzes', this.renderPermissionGrid(Constants.QUIZ_TYPE));
            this.showChildView('users', this.renderPermissionGrid(Constants.USER_TYPE));		    
		},
		
		renderAssignmentGrid: function() {
            var self = this;                
            Backgrid.PermsCell = Backgrid.Cell.extend({
              className: "assigned-perms-cell",             
              render : function() {
                var tpl = _.template(assignedPermsRowTpl); 
                var html = tpl({perms:this.model.get('perms'), Constants:Constants});
                this.$el.append(html);
                return this;
              }         
            });
            
            Backgrid.UserCell = Backgrid.Cell.extend({
              className: "user-cell",
              events: {
                  'click': 'selectUser'
              },
              
              selectUser: function() {
                  self.showChildView('details', new PermissionAssignFormView({userId:this.model.get('user').id}));
              },
              
              render : function() {
                var tpl = _.template(userRowTpl); 
                var html = tpl(this.model.attributes);
                this.$el.append(html);
                return this;
              }         
            });
            
            var columns = [
              {
                name: "username",
                label: "User",
                editable: false,
                sortable: false,
                cell: "user",
              },
              {
                name: "userid",
                label: "ID",
                editable: false,
                sortable: false,
                cell: "string",
              },
              /*{
                name: "perms",
                label: "Perms",
                editable: false,
                sortable: false,
                cell: "perms",
              },*/
            ];
                
            var backgridView = new Backgrid.Grid({
              className: 'backgrid items table table-striped table-bordered table-hover table-condensed',
              columns: columns,
              collection: this.assignments,
              emptyText: "A man without history is a tree without roots.",
            });
            
            var filter = new Backgrid.Extension.ClientSideFilter({
              collection: this.assignments,
              fields: ['username']
            });
            
           this.$('.assignments-filter').html(filter.render().el);
            
            
            return backgridView;
		},
		
		renderPermissionGrid: function(type) {
            var self = this;                
            Backgrid.ActionsCell = Backgrid.Cell.extend({
              className: "actions-cell",
              events : {
                'click .del-permission' : 'delete',
                'click .edit-permission' : 'edit'
              },
              
              delete : function() {
                if (confirm('Are you sure?')) {
                    this.model.destroy();                   
                }
              },
                  
              edit : function() {
                var permissionView = new PermissionFormView({model:this.model});
                vent.trigger('showModal', permissionView);
              },
              
              render : function() {
                  this.$el.append(
                    '<div class="text-center">'+
                    ' <button type="button" title="Edit permission" class="edit-permission btn btn-xs btn-success"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>'+
                    ' <button type="button" title="Delete permission" class="del-permission btn btn-xs btn-danger"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button> '+
                    '</div>'
                    );
                return this;
              }         
            });
            
            Backgrid.AssocobjCell = Backgrid.Cell.extend({
              className: "assocobj-cell",
              events: {
                  'click': 'selectAssocobj'
              },
              
              selectAssocobj: function() {
                  self.showChildView('details', new PermissionDataView({type:this.model.get('type'), data:this.model.get('data')}));
              },
              
              render : function() {
                this.$el.append(this.model.get('assocobj'));
                return this;
              }         
            });
            
            var columns = [];
            if (type==Constants.GROUP_TYPE || 
                type==Constants.QUIZ_TYPE ||
                type==Constants.USER_TYPE) {
                columns.push({
                    name: "assocobj",
                    label: Utils.getTypeName(type).ucfirst(),
                    editable: false,
                    sortable: false,
                    cell: "assocobj",    
                });
            }

            if (type==Constants.OPERATION_TYPE) {
                columns.push({
                    name: "name",
                    label: "Permission",
                    editable: false,
                    sortable: false,
                    cell: "string",    
                });
                columns.push({
                    name: "description",
                    label: "Description",
                    editable: false,
                    sortable: false,
                    cell: "string",    
                });
                columns.push({
                    name: "actions",
                    label: "",
                    editable: false,
                    sortable: false,
                    cell: "actions",    
                });
            }
            var backgridView = new Backgrid.Grid({
              className: 'backgrid items table table-striped table-bordered table-hover table-condensed',
              columns: columns,
              collection: this.permissions.byType(type),
              emptyText: "A man without history is a tree without roots.",
            });

            var filter = new Backgrid.Extension.ClientSideFilter({
              collection: this.permissions.byType(type),
              fields: ['assocobj', 'name']
            });
            
            //this.$('.permissions-filter-type-'+type).html(filter.render().el);

            return backgridView;
		},
			
		templateHelpers : function() {
		},
		
	});
	 
	return PermissionsLayout;
});