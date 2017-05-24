define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizQuestion'
], function($, _, Backbone, QuizQuestion){
  var QuizQuestions = Backbone.Collection.extend({
    url: 'api/quiz/question', 
    model: QuizQuestion,
  });

  return QuizQuestions;
});