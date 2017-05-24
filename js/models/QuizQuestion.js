define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
], function($, _, Backbone, Constants){
    var QuizQuestion = Backbone.Model.extend({
        urlRoot: 'api/quiz/question', 
        defaults : {
            id: null,
            quiz_id: null,
            text: {int:null, ro:null, en:null},
            quizgroup_id: null,
            options: []
        },
    });

    return QuizQuestion;
});