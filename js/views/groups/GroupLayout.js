define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Group',
  'views/groups/GroupFormView',
  'views/groups/GroupAssignMembersView',
  'views/groups/GroupInfoView',
  'views/groups/GroupMembersView',
  'text!templates/groups/group-layout.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Group, GroupFormView, GroupAssignMembersView, GroupInfoView, GroupMembersView, groupTpl, Utils, Constants, vent){
    var GroupLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(groupTpl),
        regions : {
            info : '.group-info-container',
            members : '.group-members-container',
        },
        
        initialize : function(options) {
            var self = this;
            this.model = new Group({id:options.id});
            console.log(this.model);
            this.model.fetch({async:false});
            vent.trigger('router.page.info.update',{bcs:[
              {href:'#groups', text:'Groups'}, 
              {href:'#group/'+this.model.id, text:this.model.get('name')}
            ]});  

        },
        
        events : {
            'click .btn-add-group': 'addGroup',
            'click .btn-edit-group': 'editGroup',
            'click .btn-del-group': 'delGroup',
            'click .btn-manage-group-members' : 'manageGroupMembers'
        },
        
        addGroup : function() {
            var groupView = new GroupFormView({model:new Group()});
            vent.trigger('showModal', groupView);
        },

        editGroup : function() {
            var groupView = new GroupFormView({model:this.model});
            vent.trigger('showModal', groupView);
        },
        
        delGroup : function() {
            var self = this;
            alertify.confirm('Delete '+ this.model.get('name'), 'Are you sure you want to delete?', 
                function(){ self.model.destroy({
                    success: function(model, response) {
                        vent.trigger('groups.layout.refresh');                            
                    }
                });},
                function(){ alertify.error('Cancel');}
            );
        },

        manageGroupMembers : function() {
            var view = new GroupAssignMembersView({model:this.model});
            vent.trigger('showModal', view);
        },

        onBeforeShow: function() {
            this.showChildView('info', new GroupInfoView({model:this.model}));
            this.showChildView('members', new GroupMembersView({model:this.model}));
        },
        templateHelpers : function() {
            return {
            };
        },
        
    });
     
    return GroupLayout;
});