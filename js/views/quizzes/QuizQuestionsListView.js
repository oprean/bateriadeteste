define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/QuizQuestions',
  'models/QuizOption',
  'views/quizzes/QuizQuestionFormView',
  'views/quizzes/QuizOptionFormView',
  'text!templates/quizzes/quiz-questions-list.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, QuizQuestions, QuizOption, QuizQuestionFormView, QuizOptionFormView, quizQuestionsListTpl, Constants, Utils, vent, globals){
  var QuizQuestionsListView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizQuestionsListTpl),
    events : {
        'click .btn-edit-quiz-question' : 'editQuizQuestion',
        'click .btn-delete-quiz-question' : 'deleteQuizQuestion',
        
        'click .btn-add-quiz-question-option' : 'addQuizQuestionOption',
        'click .btn-edit-quiz-question-option' : 'editQuizQuestionOption',
        'click .btn-delete-quiz-question-option' : 'deleteQuizQuestionOption',
    },
    
    initialize : function(options) {
        var self = this;
        this.collection = new QuizQuestions();
        this.quiz = options.quiz;
        this.collection.fetch({
            async: false,
            data: { quizid: this.quiz.id },
            traditional: true
        });
        this.listenTo(vent, 'quizedit.layout.questions.refresh', function(){
            self.collection.fetch({ 
                async: false,
                data: { quizid: this.quiz.id },
                traditional: true
            });
            self.render();
        });
    },
    
    onRender: function() {
        var self = this;
        this.$( ".sortable-questions" ).sortable({
            update: function( event, ui ) {
                self.sortQuestions();
            }
        });  
        this.$( ".sortable-options" ).sortable({
            update: function( event, ui ) {
                self.sortOptions();
            }
        });
    },
    
    templateHelpers: function() {
        return {
            quiz: this.quiz,
            Constants: Constants,
            lang: 'ro',
            questions: this.collection.models
        };
    },
    
    sortQuestions: function() {
        var orderedQuestions=[];
        _.each(this.$('.quiz-question-item'), function(question,i) {
            orderedQuestions.push($(question).data('id'));
        });
        $.post('api/quiz/question/sort',{qids:orderedQuestions}, function(result){
            vent.trigger('quizedit.layout.questions.refresh');
        });
    },
    
    sortOptions: function() {
        var orderedOptions=[];
        _.each(this.$('.question-option-item'), function(option,i) {
            orderedOptions.push($(option).data('id'));
        });
        $.post('api/quiz/option/sort',{oids:orderedOptions}, function(result){
            vent.trigger('quizedit.layout.questions.refresh');
        });     
    },
    
    addQuizQuestionOption : function(e) {
        var parent_id = $(e.target).data('id');
        var view = new QuizOptionFormView({
            quiz:this.quiz, 
            type: Constants.QUIZ_OPTION_QUESTION_TYPE,
            parent_id:parent_id
        });
        vent.trigger('showModal', view);  
    },
    
    editQuizQuestionOption : function(e) {
        var id = $(e.target).data('id');
        var view = new QuizOptionFormView({
            quiz:this.quiz, 
            type: Constants.QUIZ_OPTION_QUESTION_TYPE,
            id: id,
        });
        vent.trigger('showModal', view);  
    },
    
    deleteQuizQuestionOption : function(e) {
        alertify.confirm('Delete this option?', 
            $(e.target).parent().children('.option-text').html(), 
            function(){
                var id = $(e.target).data('id');
                var option = new QuizOption({id:id}); 
                  option.destroy({
                    success: function() {
                        vent.trigger('quizedit.layout.questions.refresh');
                    }
                  });
            },
            function(){ alertify.error('Cancel');}
        );
    },   
    
    editQuizQuestion : function(e) {
        var id = $(e.target).data('id');
        var view = new QuizQuestionFormView({quiz:this.quiz, model:this.collection.get(id)});
        vent.trigger('showModal', view);
    },

    deleteQuizQuestion : function(e) {
        var self = this;
        alertify.confirm('Delete this question?', 
            $(e.target).parent().parent().children('.question-text').html(), 
            function(){
                var id = $(e.target).data('id');
                var question = self.collection.get(id);
                question.destroy({
                    success: function() {
                        vent.trigger('quizedit.layout.questions.refresh');
                    }
                });
            },
            function(){ alertify.error('Cancel');}
        );
    },
    
  });

  return QuizQuestionsListView;
});