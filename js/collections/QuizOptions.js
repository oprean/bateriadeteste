define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizOption'
], function($, _, Backbone, QuizOption){
  var QuizOptions = Backbone.Collection.extend({
    url: 'api/quiz/option', 
    model: QuizOption,
  });

  return QuizOptions;
});