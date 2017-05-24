define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'text!templates/permissions/permission-form.html',
  'components/Constants',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, permissionTpl, Constants, vent){
	var PermissionView = Backbone.Modal.extend({
		template: _.template(permissionTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		initialize : function() {
			var self = this;
						
			this.realModel = this.model;
			this.model = this.realModel.clone();
			console.log(this.model);			
		},
			
		onShow : function() {
			Backbone.Validation.bind(this);
		},
		
		templateHelpers : function() {
			return {
				types: Constants.PERMISSION_TYPES
			};
		},
		
		fillModel : function(model) {
			model.set({
				name : this.$('#name').val(),
				description : $('#description').val(),
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
					vent.trigger('admin.permissions.grid.refresh');					
				},
			});
		}				
	});

	return PermissionView;
});