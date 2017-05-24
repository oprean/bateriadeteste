define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Quizzes',
  'views/quizzes/QuizLayout',
  'text!templates/quizzes/quizzes-layout.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Quizzes, QuizLayout, quizzesTpl, Utils, Constants, vent){
	var QuizzesLayout = Backbone.Marionette.LayoutView.extend({
		template : _.template(quizzesTpl),
		regions : {
			quiz : '.quiz-container',
		},
		
		initialize : function(options) {
			var self = this;
			
			console.log(options);
			
			this.quizid = options.id;
			this.quizzes = new Quizzes();
			this.quizzes.fetch({async:false});
			vent.trigger('router.page.info.update',{bcs:[{href:'#quizzes', text:i18n.t('quizzes')}]});
			this.listenTo(vent, 'quizzes.layout.refresh', function(){
				self.quizzes.fetch({ success: function(collection){
                    self.render();
                    self.onBeforeShow();  
					}
				});
			});
		},
		
        onBeforeShow: function() {
            if (this.quizid) {
                this.showChildView('quiz', new QuizLayout({id:this.quizid}));                
            }

        },
		
		templateHelpers : function() {
            return {
                quizzes: this.quizzes,
                quizid: this.quizid
            };
		},
		
	});
	 
	return QuizzesLayout;
});