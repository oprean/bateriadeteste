define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'models/Permission',
  'text!templates/permissions/permission-data.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Permission, permDataTpl, Constants, Utils, vent, globals){
  var PermissionDataView = Backbone.Marionette.ItemView.extend({
    template : _.template(permDataTpl),
    events : {
        'click .btn-fix-permission' : 'fixPermissions'
    },
  
    initialize : function(options) {
        var self = this;
        this.model = new Permission();
        this.model.url = 'api/permission/type/'+this.options.type+'/'+this.options.data;
        this.model.fetch({
            async:false
        });
        var defaults = Utils.getDefaultPermissions(parseInt(options.type));
        this.missingPerm = false; 
        _.each(defaults, function(def) {
            var found = _.findWhere(self.model.get('perms'),{name: def});
            if (!found) {
                self.missingPerm = true;
                return;
            } 
        });
    },

    fixPermissions: function() {
        var self = this;
        $.get('api/permission/type/'+this.options.type+'/'+this.options.data+'/fix', function(result){
            alertify.success('Permissions fixed!');
            self.model.fetch({
                async:false,
                success: function() {
                    self.missingPerm = false;
                    self.render();                    
                }
            });
        });
    },
        
    templateHelpers: function() {
        return {
            missingPerm: this.missingPerm
        };
    }
    
  });

  return PermissionDataView;
});