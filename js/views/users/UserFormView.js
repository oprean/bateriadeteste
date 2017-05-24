define([
  'jquery',
  'underscore',
  'backbone',
  'models/User',
  'components/Constants',
  'components/Utils',
  'text!templates/users/user-form.html',
  'text!templates/users/user-quota-form.html',
  'components/Constants',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, User, Constants, Utils, userTpl, quotaTpl, Constants, vent){
	var UserView = Backbone.Modal.extend({
		template: _.template(userTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		initialize : function() {
			var self = this;
			
			this.model = new User({id:this.model.id});
			this.model.fetch({async:false});
			
			this.realModel = this.model;
			this.model = this.realModel.clone();
			console.log(this.model);			
		},

		events : {
			'change #type' : 'changeType'
		},
			
		changeType : function(e) {
			if (this.$('#type').val() == 'leader') {
				this.renderQuota();
			} else {
				this.$('#quota-container').html('');
			}
		},
		
		renderQuota : function() {
			var template = _.template(quotaTpl);
			this.$('#quota-container').html(template({rc:this.model.attributes}));
		},
		
		onShow : function() {
			Backbone.Validation.bind(this);
		},

		templateHelpers : function() {
			return {
				types: Constants.USER_TYPES
			};
		},

		fillModel : function(model) {
			model.set({
				username : this.$('#username').val(),
                firstname : this.$('#firstname').val(),
                lastname : this.$('#lastname').val(),
				password : this.$('#password').val(),
				email : this.$('#email').val(),
				type : this.$('#type').val(),
				maxusers : this.$('#maxusers').val(),
				maxgroups : this.$('#maxgroups').val(),
				is_admin : this.$('#is_admin').is(":checked"),
			});
		},
		
		beforeSubmit : function() {
			this.fillModel(this.model);
			return this.model.isValid(true);
		},
		
		submit: function() {
			this.fillModel(this.realModel);
			console.log('submit');
			this.model.save(null, {
				success: function(model) {
					vent.trigger('admin.users.grid.refresh');					
				},
			});
		}				
	});

	return UserView;
});