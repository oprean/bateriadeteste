define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Quiz',
  'collections/QuizQuestions',
  'text!templates/quizzes/quiz-edit-layout.html',
  
  'views/quizzes/QuizQuestionFormView',
  'views/quizzes/QuizQuestionsListView',
  'views/quizzes/QuizGroupFormView',
  'views/quizzes/QuizGroupsListView',
  'views/quizzes/QuizOptionFormView',
  'views/quizzes/QuizOptionsListView',
  'views/quizzes/QuizPreviewView',
  
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Quiz, Questions, questionsTpl, 
        QuizQuestionFormView, QuizQuestionsListView,
        QuizGroupFormView, QuizGroupsListView, 
        QuizOptionFormView, QuizOptionsListView,
        QuizPreviewView,
        Utils, Constants, vent){
    var QuizEditLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(questionsTpl),
        regions : {
            qquestions : '.questions-container',
            qgroups : '.groups-container',
            qoptions : '.options-container',
        },
        
        events : {
            'click .btn-add-quiz-group': 'addQuizGroup',
            'click .btn-add-quiz-option': 'addQuizOption',
            'click .btn-add-quiz-question': 'addQuizQuestion',
            'click .btn-preview-quiz': 'previewQuiz',
        },
        
        initialize : function(options) {
            var self = this;
            
            console.log(options);
            
            this.model = new Quiz({id:options.quizid});
            console.log(this.model);
            this.model.fetch({async:false});
             vent.trigger('router.page.info.update',{bcs:[
              {href:'#quizzes', text:'Quizzes'}, 
              {href:'#quiz/'+this.model.id, text:qtr(this.model.get('name'))},
              {href:'#quiz/'+this.model.id+'/questions', text:'Content'}
            ]});  
        },
        
        addQuizGroup : function() {
            var view = new QuizGroupFormView({quiz:this.model});
            vent.trigger('showModal', view);
        },
     
        addQuizOption : function() {
            var view = new QuizOptionFormView({
                quiz:this.model,
                type: Constants.QUIZ_OPTION_QUIZ_TYPE,  
                parent_id:this.model.id
            });
            vent.trigger('showModal', view);
        },
        
		previewQuiz: function() {
            var view = new QuizPreviewView({model:this.model});
            vent.trigger('showModal', view);
		},

        addQuizQuestion : function() {
            var view = new QuizQuestionFormView({quiz:this.model});
            vent.trigger('showModal', view);
        },
        
        onBeforeShow: function() {
            this.showChildView('qquestions', new QuizQuestionsListView({quiz:this.model}));                
            this.showChildView('qgroups', new QuizGroupsListView({quiz:this.model}));
            if (this.model.get('type')==Constants.QUIZ_TYPE_GIFTS) {
                this.showChildView('qoptions', new QuizOptionsListView({quiz:this.model, parent_id:this.model.id, type: Constants.QUIZ_OPTION_QUIZ_TYPE}));                
            }
        },
        
        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },
        
    });
     
    return QuizEditLayout;
});