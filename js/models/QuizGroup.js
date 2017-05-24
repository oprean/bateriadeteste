define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){
    var QuizGroup = Backbone.Model.extend({
        urlRoot: 'api/quiz/group', 
        defaults : {
            id: null,
            name: {int:null, ro:null, en:null},
            description: {int:null, ro:null, en:null},
            quiz_id: null,
        }
    });

    return QuizGroup;
});