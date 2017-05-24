define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'collections/QuizQuestions',
  'text!templates/quizzes/quiz-preview.html',
  'components/Utils',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, QuizQuestions, quizTpl, Utils, vent){
	var QuizPreviewView = Backbone.Modal.extend({
		template: _.template(quizTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		initialize : function() {
			var self = this;
			this.questions = new QuizQuestions();
			this.questions.fetch({
	            async: false,
	            data: { quizid: this.model.id },
	            traditional: true
	        });
		},
		
		onShow: function() {
		  	var ww = $(window).width();
			this.$('.bbm-modal').css('margin-top',-120);
			this.$('.bbm-modal').css('max-width',ww*0.95);
		},
				
        templateHelpers : function() {
            return {
            	quiz: this.model,
            	questions : this.questions, 
            	renderOption: Utils.renderOption,
                Constants : Constants
            };
        },		
	});

	return QuizPreviewView;
});