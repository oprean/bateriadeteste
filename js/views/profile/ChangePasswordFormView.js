define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/User',
  'text!templates/profile/change-password-form.html',
  'components/Utils',
  'components/Events',
], function($, _, Backbone, Marionette, User, resultTpl, Utils, vent){
    var ChangePasswordFormView = Backbone.Modal.extend({
        template : _.template(resultTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',
        initialize : function(options) {
            this.user = this.model.clone();
            this.user.url = 'api/user/'+this.user.id+'/password';
        },
             

        fillModel : function(model) {
            model.set({
                oldpass : this.$('#oldpass').val(),
                newpass1 : this.$('#newpass1').val(),
                newpass2 : this.$('#newpass2').val(),
            });
        },
               
        beforeSubmit : function() {
            var self = this;
            this.fillModel(this.user);
            this.valid=true;
            this.user.save(null, {
                async:false,
                success: function(model) {
                    alertify.success('Password updated');
                }, 
                error: function(model, error){
                    console.log(error);
                    self.$('#change-pass-errors').html(error.responseJSON.join('<br/>'));
                    self.valid = false;
                }
            });
            return this.valid;
        },
        
        //submit : function() {},                 

    });
     
    return ChangePasswordFormView;
});