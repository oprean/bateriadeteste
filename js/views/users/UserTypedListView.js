define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Quizzes',
  'collections/Users',
  'collections/Groups',
  'collections/Permissions',
  'text!templates/users/typed-list.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Quizzes, Users, Groups, Permissions, profileListTpl, Constants, Utils, vent, globals){
  var UserTypedListView = Backbone.Marionette.ItemView.extend({
    template : _.template(profileListTpl),

    initialize : function(options) {
        var self = this;
        this.list = options.list;
        this.title = options.title;
        this.type = options.type;
        this.href = options.href;
        this.attr = options.attr;
        this.select = this.getSelect(this.type);
        this.showCtrl = options.showCtrl;
    },
    
    events: {
        'click .btn-del': 'delItem',
        'click .btn-add': 'addItem'
    },
    
    getSelect: function(type) {
        var select={};
        switch(type) {
          case 'quiz':
                select = Utils.getPermissions(Constants.QUIZ_TYPE, this.model.id);
                break;
          case 'group':
                select = Utils.getPermissions(Constants.GROUP_TYPE, this.model.id);
                break;
          case 'permission':
                select = Utils.getPermissions(Constants.OPERATION_TYPE, this.model.id);
                break;          
        }

        return select.unassigned;
    },
    
    addItem: function(e) {
      switch(this.type) {
          case 'quiz':
          case 'group':
          case 'permission':
                if(this.$('.item-select').val()!=null) {
                    Utils.togglePermission(this.model.id, this.$('.item-select').val());                    
                }
                break;
      }
      vent.trigger('user.refresh');      
    },
    
    delItem: function(e) {    
      switch(this.type) {
          case 'quiz':
          case 'group':
          case 'permission':
                Utils.togglePermission(this.model.id, $(e.target).data('item-id'));
                break;
      }
      vent.trigger('user.refresh');
    },
    
    onRender: function() {
      this.$('.item-select').select2();  
    },
    
    templateHelpers: function() {
                
        return {
            list: this.list,
            select: this.select,
            title: this.title,
            type: this.type,
            href: this.href,
            attr: this.attr,
            showCtrl: this.showCtrl,
            Constants: Constants
        };
    }
  });

  return UserTypedListView;
});