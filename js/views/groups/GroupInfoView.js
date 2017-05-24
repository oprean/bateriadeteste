define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'text!templates/groups/group-info.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, groupInfoTpl, Constants, Utils, vent, globals){
  var GroupInfoView = Backbone.Marionette.ItemView.extend({
    template : _.template(groupInfoTpl),
    events : {

    },
        
    initialize : function(options) {
    },
    
    templateHelpers: function() {
        return {
        };
    }
    
  });

  return GroupInfoView;
});