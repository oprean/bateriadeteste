define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'models/Permission',
  'text!templates/permissions/permission-assign-form.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Permission, permAssignTpl, Constants, Utils, vent, globals){
  var PermissionAssignFormView = Backbone.Marionette.ItemView.extend({
    template : _.template(permAssignTpl),
    events : {
        'click .btn-assign-permission' : 'assignPerm',
        'click .btn-unassign-permission' : 'unassignPerm'
    },
        
    initialize : function(options) {
        var self = this;
        console.log(options);
        this.model = new Permission();
        this.userId = options.userId;
        this.model.url = 'api/permission/user/'+options.userId;
        this.model.fetch({
            async:false
        });
    },
    
    assignPerm: function() {
      var self = this;
      Utils.togglePermission(this.userId, this.$('.unassigned-perms').val());
      this.model.fetch({success: function(){
          self.render();
      }});  
    },
    
    unassignPerm: function(e) {
      var self = this;
      Utils.togglePermission(this.userId, $(e.target).data('perm-id'));
      this.model.fetch({success: function(){
          self.render();
      }});  
    },
    
    onRender: function() {
      this.$('.unassigned-perms').select2();    
    },
    
    templateHelpers: function() {
        return {

        };
    }
    
  });

  return PermissionAssignFormView;
});