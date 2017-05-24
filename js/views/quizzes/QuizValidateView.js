define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/QuizQuestions',
  'models/Quiz',
  'models/QuizResult',
  'text!templates/quizzes/quiz-validate.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, QuizQuestions, Quiz, QuizResult, quizValidateTpl, Constants, Utils, vent, globals){
  var QuizValidateView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizValidateTpl),
    events : {
        'click .btn-validate' : 'validateAnswers'
    },
    
    initialize : function(options) {
        var self = this;
        this.model = new Quiz({id:options.quiz_id});
        this.model.fetch({async:false});
        this.questions = new QuizQuestions();
        this.questions.fetch({
            async: false,
            data: { quizid: this.model.id },
            traditional: true
        });
    },
    
    templateHelpers: function() {
        return {
            quiz: this.model,
            questions : this.questions, 
            renderOption: Utils.renderOption,
            Constants : Constants
        };
    },
    
    validateAnswers: function() {
        var self = this;
        alertify.confirm('You are done!', 'Are these the final answers?', 
            function(){
                if (parseInt(self.model.get('type')) == Constants.QUIZ_TYPE_SURVEY) {
                    results = new QuizResult();
                    results.urlRoot = 'api/quiz/'+self.model.id+'/result';
                    results.fetch({
                        async:false
                    });   
                    window.location.hash = '#';
                } else {
                    // we go to result pages
                    window.location.hash = '#quiz/' + self.model.id + '/q/result';                    
                }
            },
            function(){
                //alertify.notify('sample', 'success', 5, function(){  console.log('dismissed');
            }
        );
    }
  });

  return QuizValidateView;
});