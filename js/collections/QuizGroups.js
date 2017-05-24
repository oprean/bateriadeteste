define([
  'jquery',
  'underscore',
  'backbone',
  'models/QuizGroup'
], function($, _, Backbone, QuizGroup){
  var QuizGroups = Backbone.Collection.extend({
    url: 'api/quiz/group', 
    model: QuizGroup,
  });

  return QuizGroups;
});