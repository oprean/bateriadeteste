define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizGroup',
  'components/Constants',
  'text!templates/quizzes/quiz-group-form.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, QuizGroup, Constants, quizGroupFormTpl, vent){
    var QuizGroupFormView = Backbone.Modal.extend({
        template: _.template(quizGroupFormTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',

        initialize : function(options) {
            var self = this;
            this.quiz = options.quiz;
            if (!this.model) {
                this.model = new QuizGroup({quiz_id:this.quiz.id});
            }
            this.realModel = this.model;
            this.model = this.realModel.clone();        
        },
            
        onShow : function() {
            Backbone.Validation.bind(this);
        },

        fillModel : function(model) {
            model.set({
                int_name : $('#int_name').val(),
                int_description : $('#int_description').val(),
                ro_name : $('#ro_name').val(),
                ro_description : $('#ro_description').val(),
                en_name : $('#en_name').val(),
                en_description : $('#en_description').val(),
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
                    vent.trigger('quizedit.layout.groups.refresh');     
                },
            });
        }               
    });

    return QuizGroupFormView;
});