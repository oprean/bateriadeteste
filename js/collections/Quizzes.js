define([
  'jquery',
  'underscore',
  'backbone',
  'models/Quiz'
], function($, _, Backbone, Quiz){
  var Quizzes = Backbone.Collection.extend({
  	url: 'api/quiz', 
  	model: Quiz,
  });

  return Quizzes;
});