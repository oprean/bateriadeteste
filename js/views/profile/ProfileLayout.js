define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Generics',
  'models/User',
  'views/profile/ProfileInfoView',
  'views/profile/ProfileListView',
  'text!templates/profile/profile-layout.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Generics, User, ProfileInfoView, ProfileListView, profileTpl, Constants, Utils, vent, globals){
  var ProfileLayout = Backbone.Marionette.LayoutView.extend({
    template : _.template(profileTpl),
    regions : {
        info : '.profile-info-container',
        quizzes : '.profile-quizzes-container',
        memberof : '.profile-memberof-container',
        permissions : '.profile-permissions-container',
        ownusers : '.profile-ownusers-container',
        owngroups : '.profile-owngroups-container',
    },
    events : {
    },
    
    initialize : function() {
        vent.trigger('router.page.info.update',{bcs:[{href:'#profile', text:'Profile'}]});
        this.model = new User({id:appUser.id});
        this.model.fetch({async:false});
        console.log(this.model);
    },
    
    onRender: function() {
    },
    
    onBeforeShow: function() {
      this.showChildView('info', new ProfileInfoView({model:this.model}));
      if (appUser.isAdmin) {
          this.showChildView('quizzes', new ProfileListView({
              list:new Generics(this.model.get('quizzes')), 
              title: 'Assigned quizzes', type: 'quiz', attr:'description'
          }));
          this.showChildView('memberof', new ProfileListView({
              list:new Generics(this.model.get('groups')), 
              title: 'Member of', type: 'sharedGroup', attr:'description'
          }));
          this.showChildView('permissions', new ProfileListView({
              list:new Generics(this.model.get('permissions')), 
              title: 'Permissions', type: 'sharedPermission', attr:'name'
          }));
          this.showChildView('ownusers', new ProfileListView({
              list:new Generics(this.model.get('ownUser')), 
              title: 'Own users', type: 'ownUser', attr:'username'
          }));
          this.showChildView('owngroups', new ProfileListView({
              list:new Generics(this.model.get('ownGroup')), 
              title: 'Own groups', type: 'ownGroup', attr:'name'
          }));
      } else {
        switch(appUser.type) {      
            case Constants.USER_TYPE_NORMAL:
              break;
            case Constants.USER_TYPE_ADMIN:
              this.showChildView('quizzes', new ProfileListView({
                  list:new Generics(this.model.get('quizzes')), 
                  title: 'Assigned quizzes', type: 'quiz', attr:'description'
              }));
              this.showChildView('memberof', new ProfileListView({
                  list:new Generics(this.model.get('groups')), 
                  title: 'Member of', type: 'sharedGroup', attr:'description'
              }));
              this.showChildView('permissions', new ProfileListView({
                  list:new Generics(this.model.get('permissions')), 
                  title: 'Permissions', type: 'sharedPermission', attr:'name'
              }));
              this.showChildView('ownusers', new ProfileListView({
                  list:new Generics(this.model.get('ownUser')), 
                  title: 'Own users', type: 'ownUser', attr:'username'
              }));
              this.showChildView('owngroups', new ProfileListView({
                  list:new Generics(this.model.get('ownGroup')), 
                  title: 'Own groups', type: 'ownGroup', attr:'name'
              }));
              break;
            default:
              break;
        };   
      }
    },
    
    templateHelpers: function() {
        return {
        };
    }
  });
  
  return ProfileLayout;
});