define([
  'jquery',
  'underscore',
  'backbone',
  'models/Permission',
  'collections/Permissions'
], function($, _, Backbone, Permission, Permissions){
  var Permissions = Backbone.Collection.extend({
  	url: 'api/permission', 
  	model: Permission,
  	byType: function (type) {
        filtered = this.filter(function (perm) {
            return parseInt(perm.get("type")) === type;
        });
        return new Permissions(filtered);
    }
  });

  return Permissions;
});