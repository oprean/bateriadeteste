define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/QuizResult',
  'text!templates/quizzes/quiz-result.html',
  'components/Utils',
  'components/Events',
], function($, _, Backbone, Marionette, QuizResult, resultTpl, Utils, vent){
	var QuizResultView = Backbone.Marionette.ItemView.extend({
		template : _.template(resultTpl),
		initialize : function(options) {
            this.model = new QuizResult();
            this.model.urlRoot = 'api/quiz/'+options.quiz_id+'/result';
            this.model.fetch({
                async:false
            });
            
            //console.log(this.model);
            
            vent.trigger('router.page.info.update',{bcs:[
              {href:'#quizzes', text:'Quizzes', visible: appUser.hasPerm('quizzes.view')}, 
              {href:'#quiz/'+this.model.get('quiz').id+'/q/home', text:qtr(this.model.get('quiz').name)},
              {href:'#quiz/'+this.model.get('quiz_id')+'/q/result', text:qtr('result')}
            ]});
		},
		
		events : {
			'click .btn-generate-pdf' : 'generatePdf',
			'click .btn-send-email' : 'sendEmail',
			'click .score-item' : 'toggleDescription'
		},
		
		toggleDescription : function(e) {			
			this.$('.score-description').toggle();
		},
             		
        templateHelpers: function() {
            var html= Utils.renderTemplate(this.model);
            return {
                'html': html
            };
        },
        		
		sendEmail : function() {
			var self = this;
			this.$('.btn-send-email').button('loading');
			$.ajax({
				type: "POST",
				dataType: "json",
				url: 'api/mail',
				data: {
				    type: 'mail.result',
					id: this.model.get('result').id,
					title: qtr(this.model.get('quiz').name)+' '+qtr('test result'),
					html: this.$('.quiz-result-html').html(),
					username: appUser.username,
					to: appUser.email,
				}, 
				success: function(result) {
					if (result.status == 'success') {
					    alertify.success(result.data.message);
					} else {
					    alertify.error(result.data.message);
					}
				},
				error: function() {
				    alertify.error(qtr('internal server error!'));
				},
				complete: function() {
					self.$('.btn-send-email').button('reset');					
				} 
			});
		},
	});
	 
	return QuizResultView;
});