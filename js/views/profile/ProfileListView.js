define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'text!templates/profile/profile-list.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, profileListTpl, Constants, Utils, vent, globals){
  var ProfileListView = Backbone.Marionette.ItemView.extend({
    template : _.template(profileListTpl),
    events : {
    },
    
    initialize : function(options) {
        this.list = options.list;
        this.title = options.title;
        this.type = options.type;
        this.attr = options.attr;
    },
    
    templateHelpers: function() {
        return {
            list : this.list,
            title: this.title,
            type: this.type,
            attr: this.attr
        };
    }
  });

  return ProfileListView;
});