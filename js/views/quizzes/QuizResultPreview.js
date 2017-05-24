define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/QuizResult',
  'text!templates/quizzes/quiz-result-preview.html',
  'components/Utils',
  'components/Events',
], function($, _, Backbone, Marionette, QuizResult, resultTpl, Utils, vent){
    var QuizResultPreview = Backbone.Modal.extend({
        template : _.template(resultTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',
        initialize : function(options) {
            this.model = new QuizResult();
            this.model.urlRoot = 'api/quiz/result/'+options.result_id;
            this.model.fetch({
                async:false
            });
            console.log(this.model);
        },
        
        toggleDescription : function(e) {           
            this.$('.score-description').toggle();
        },
        
        onShow: function() {
            var ww = $(window).width();
            this.$('.bbm-modal').css('margin-top',-120);
            this.$('.bbm-modal').css('max-width',ww*0.95);
        },
                    
        templateHelpers: function() {
            var html= Utils.renderTemplate(this.model);
            return {
                'html': html
            };
        },
    });
     
    return QuizResultPreview;
});