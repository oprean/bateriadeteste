define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'text!templates/quizzes/quiz-form.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, quizFormTpl, vent){
	var QuizFormView = Backbone.Modal.extend({
		template: _.template(quizFormTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		initialize : function() {
			var self = this;
						
			this.realModel = this.model;
			this.model = this.realModel.clone();		
		},
			
		onShow : function() {
			Backbone.Validation.bind(this);
		},

        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },  

		fillModel : function(model) {
			model.set({
                int_name : $('#int_name').val(),
                int_description : $('#int_description').val(),
                ro_name : $('#ro_name').val(),
                ro_description : $('#ro_description').val(),
                en_name : $('#en_name').val(),
                en_description : $('#en_description').val(),
				type : $('#type').val(),
				active : $('#active').is(":checked"),
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
					vent.trigger('quizzes.layout.refresh');					
				},
			});
		}				
	});

	return QuizFormView;
});