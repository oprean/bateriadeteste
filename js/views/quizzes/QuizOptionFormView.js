define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizOption',
  'collections/QuizGroups',
  'components/Constants',
  'text!templates/quizzes/quiz-option-form.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, QuizOption, QuizGroups, Constants, quizOptionFormTpl, vent){
    var QuizOptionFormView = Backbone.Modal.extend({
        template: _.template(quizOptionFormTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',

        initialize : function(options) {
            var self = this;
            this.quiz = options.quiz;
            this.type = options.type;
            
            if (!this.model) {
                if (options.id) {
                    this.model = new QuizOption({id:options.id});
                    this.model.fetch({async:false});
                } else {
                    this.model = new QuizOption({
                        parent_type: this.type,
                        parent_id:options.parent_id,
                    });                    
                }
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
                quiz: this.quiz,
                Constants : Constants,
                groups: this.groups.models,
            };
        },

        fillModel : function(model) {
            model.set({
                int_text : $('#int_text').val(),
                ro_text : $('#ro_text').val(),
                en_text : $('#en_text').val(),
                value : $('#value').val(),
                type : $('#type').val(),
                quizgroup_id : $('#quizgroup_id').val(),
            });
        },
        
        beforeSubmit : function() {
            this.fillModel(this.model);
            return this.model.isValid(true);
        },
        
        submit: function() {
            var self = this;
            this.fillModel(this.realModel);
            console.log('submit');
            this.model.save(null, {
                success: function(model) {
                    if (self.type == Constants.QUIZ_OPTION_QUESTION_TYPE) {
                        vent.trigger('quizedit.layout.questions.refresh');
                    } else {
                        vent.trigger('quizedit.layout.options.refresh');
                    }
     
                },
            });
        }               
    });

    return QuizOptionFormView;
});