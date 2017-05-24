define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'text!templates/profile/profile-info.html',
  'views/profile/ChangePasswordFormView',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, profileInfoTpl, ChangePasswordFormView, Constants, Utils, vent, globals){
  var ProfileInfoView = Backbone.Marionette.ItemView.extend({
    template : _.template(profileInfoTpl),
    events : {
        'click .btn-profile-update' : 'updateProfile',
        'click .btn-change-password' : 'changePass'
    },
    
    changePass: function() {
        var view = new ChangePasswordFormView({model: this.model});
        vent.trigger('showModal', view);
    },
    
    updateProfile: function() {
      this.model.set({
        firstname:this.$('#firstname').val(),
        lastname:this.$('#lastname').val(),
        email:this.$('#email').val(),
        type : this.$('#type').val(),
        maxusers : this.$('#maxusers').val(),
        maxgroups : this.$('#maxgroups').val(),
      });
      this.model.save(null,{
          success: function() {
              vent.trigger('user.refresh');
              alertify.success('Profile updated!');
          }
      });
    },
    
    initialize : function(options) {
    },
    
    templateHelpers: function() {
        return {
            types: Constants.USER_TYPES
        };
    }
    
  });

  return ProfileInfoView;
});