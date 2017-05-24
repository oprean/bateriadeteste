define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Generics',
  'models/User',
  'views/profile/ProfileInfoView',
  'views/users/UserTypedListView',
  'text!templates/users/user-layout.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Generics, User, ProfileInfoView, UserTypedListView, userTpl, Constants, Utils, vent, globals){
  var UserLayout = Backbone.Marionette.LayoutView.extend({
    template : _.template(userTpl),
    regions : {
        info : '.user-info-container',
        quizzes : '.user-quizzes-container',
        memberof : '.user-memberof-container',
        permissions : '.user-permissions-container',
        ownusers : '.user-ownusers-container',
        owngroups : '.user-owngroups-container',
    },
    events : {
    },
    
    initialize : function(options) {
        var self = this;
        this.model = new User({id:options.id});
        this.model.fetch({async:false});
        console.log(this.model);
        vent.trigger('router.page.info.update',{bcs:[
            {href:'#users', text:qtr('users')},
            {href:'#user/'+this.model.id, text:this.model.get('username')}
        ]});
        this.listenTo(vent, 'user.refresh', function(){
            self.model.fetch({async:false});
            self.onBeforeShow();
        });
    },
        
    onBeforeShow: function() {
      this.showChildView('info', new ProfileInfoView({model:this.model}));
      console.log(this.model.get('quizzes'));
      
      this.showChildView('quizzes', new UserTypedListView({
          model:this.model, showCtrl:true,
          list: this.model.get('quizzes'), href: 'quiz', 
          title: 'Assigned quizzes', type: 'quiz', attr:'description'
      }));
      this.showChildView('memberof', new UserTypedListView({
          model:this.model, showCtrl:true,
          list:this.model.get('groups'), href: 'group',
          title: 'Member of', type: 'group', attr:'description'
      }));

      if (this.model.get('type') == 'leader' || this.model.get('type') == 'admin') {
          this.showChildView('ownusers', new UserTypedListView({
              model:this.model, showCtrl:false,
              list:this.model.get('ownUser'), href: 'user',
              title: 'Own users', type: 'ownUser', attr:'username'
          }));
          this.showChildView('owngroups', new UserTypedListView({
              model:this.model, showCtrl:false,
              list:this.model.get('ownGroup'), href: 'group',
              title: 'Own groups', type: 'ownGroup', attr:'name'
          }));
      }
      
      if (appUser.isAdmin) {
        this.showChildView('permissions', new UserTypedListView({
          model:this.model, showCtrl:true,
          list:this.model.get('permissions'), href: 'permission',
          title: 'Permissions', type: 'permission', attr:'name'
        }));          
      }
    },
    
    templateHelpers: function() {
        return {
        };
    }
  });
  
  return UserLayout;
});