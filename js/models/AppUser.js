define([
  'jquery',
  'underscore',
  'backbone',
  'collections/Settings',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Settings, Constants, Utils, vent, globals){
    
    var AppUser = Backbone.Model.extend({

	   urlRoot: 'api/user/js',

        defaults : {
            id: null,
            username: null,
            email: null,
            type: null,
            isAdmin: null,
            permissions: null,
            quizzes: null,
            ownUser: null,
            ownGroup: null,
        },

        initialize: function() {
            var self = this;
            this.listenTo(vent, 'current.user.update', function(modalView) {
                console.log('current.user.update');
                self.updateCurentUser(globals.user.uid);
            });

            vent.trigger('current.user.update');
        },

        updateCurentUser : function() {
            var self = this;
            $.ajax({
                url : 'api/user/js/' + globals.user.uid,
                dataType: 'json',
                async: false, 
                success : function(data) {
                    Settings.setVal('current-user', data);
                    self.set(data);
                    self.id = data.id;                    
                    self.token = data.token;                    
                    self.type = data.type;
                    self.firstname = data.firstname;
                    self.lastname = data.lastname;
                    self.username = data.username;
                    self.email = data.email;
                    self.permissions = data.permissions;
                    self.isAdmin = data.isAdmin;

                    self.ownGroup = data.ownGroup;
                    self.maxgroups = data.maxgroups;                    
                    self.groupQuota = data.groupQuota;

                    self.ownUser = data.ownUser;
                    self.maxusers = data.maxusers;
                    self.userQuota = data.userQuota;

                    self.quizzes = data.quizzes;
                }
            });
        },

        permCheck : function(perms,perm) {
            return this.isAdmin || perms.indexOf(perm)>=0 || perms.indexOf('admin')>=0;
        },

        hasPerm : function(perm) {
            return ($.inArray(perm, this.permissions) >= 0) || this.isAdmin;
        },
         
        is : function(userType) {
            return this.type == userType || this.type == Constants.USER_TYPE_ADMIN || this.isAdmin;
        },
    });

    return AppUser;
});