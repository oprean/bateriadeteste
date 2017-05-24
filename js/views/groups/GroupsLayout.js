define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Group',
  'collections/Groups',
  'views/groups/GroupLayout',
  'text!templates/groups/groups-layout.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Group, Groups, GroupLayout, groupsTpl, Utils, Constants, vent){
    var GroupsLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(groupsTpl),
        regions : {
            group : '.group-container',
        },
        
        initialize : function(options) {
            var self = this;
            this.groups = new Groups();
            this.groups.fetch({async:false});
            this.groupid = options.id;
            vent.trigger('router.page.info.update',{bcs:[{href:'#groups', text:'Groups'}]});
            this.listenTo(vent, 'groups.layout.refresh', function(){
                self.groups.fetch({success:function(){
                    self.render();
                    self.onBeforeShow();                    
                }});
            });
        },
        
        onBeforeShow: function() {
            if (this.groupid) {
                this.showChildView('group', new GroupLayout({id:this.groupid}));                
            }

        },
        templateHelpers : function() {
            return {
                groups: this.groups,
                groupid: this.groupid
            };
        },
        
    });
     
    return GroupsLayout;
});