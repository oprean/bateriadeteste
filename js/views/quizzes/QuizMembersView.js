define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'text!templates/groups/group-members.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, groupTpl, vent){
    var GroupMembersView = Backbone.Marionette.ItemView.extend({
        template: _.template(groupTpl),
        events: {         
        },

        initialize : function() {
            var self = this;
        },
                     
    });

    return GroupMembersView;
});