define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
], function($, _, Backbone, Constants){
    var QuizAnswer = Backbone.Model.extend({
        urlRoot: 'api/quiz/answer', 
        defaults : {
            id: null,
            quiz_id: null,
            question_id: null,
            user_id: null,
            session_id: null,
            data: null
        },
        
        validate: function(attrs, options) {
            if (options.quiz_type == Constants.QUIZ_TYPE_BELBIN) {
                var total=0;
                _.each(attrs.data, function(option){
                    var val = parseInt(option.option_val);
                    if(!isNaN(val)) total += val;
                });

                if (total!=10) return '<strong>Total: '+total+'</strong> Total value must be 10!';
            }
        }
    });

    return QuizAnswer;
});