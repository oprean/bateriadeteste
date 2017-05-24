define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizQuestion',
  'collections/QuizGroups',
  'components/Constants',
  'text!templates/quizzes/quiz-question-form.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, QuizQuestion, QuizGroups, Constants, quizQuestionFormTpl, vent){
    var QuizQuestionFormView = Backbone.Modal.extend({
        template: _.template(quizQuestionFormTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',

        initialize : function(options) {
            var self = this;
            this.quiz = options.quiz;
            if (!this.model) {
                this.model = new QuizQuestion({quiz_id:this.quiz.id});
            }
            this.realModel = this.model;
            this.model = this.realModel.clone();   
            
            this.groups = new QuizGroups();
            this.groups.fetch({
                async: false,
                data: { quizid: this.quiz.id },
                traditional: true
            });
        },
            
        onShow : function() {
            Backbone.Validation.bind(this);
        },

        templateHelpers: function() {
            return {
                quiz:this.quiz,
                groups: this.groups.models,
                Constants : Constants
            };
        },

        fillModel : function(model) {
            model.set({
                int_text : $('#int_text').val(),
                ro_text : $('#ro_text').val(),
                en_text : $('#en_text').val(),
                quizgroup_id : $('#quizgroup_id').val(),
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
                    vent.trigger('quizedit.layout.questions.refresh');     
                },
            });
        }               
    });

    return QuizQuestionFormView;
});