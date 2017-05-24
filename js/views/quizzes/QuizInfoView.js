define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'text!templates/quizzes/quiz-info.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, quizInfoTpl, Constants, Utils, vent, globals){
  var QuizInfoView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizInfoTpl),
    events : {

    },
    
    initialize : function(options) {
    },
    
    templateHelpers: function() {
        return {
            Constants:Constants
        };
    }
    
  });

  return QuizInfoView;
});