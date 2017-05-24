define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){
    var QuizOption = Backbone.Model.extend({
        urlRoot: 'api/quiz/option', 
        defaults : {
            id: null,
            parent_id: null,
            parent_type: null,
            quizgroup_id: null,
            text: {int:null, ro:null,en:null},
            type: null,
            value: null
        }
    });

    return QuizOption;
});