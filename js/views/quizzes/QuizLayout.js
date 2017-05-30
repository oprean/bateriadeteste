define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Quiz',
  'views/quizzes/QuizFormView',
  'views/quizzes/QuizAssignMembersView',
  'views/quizzes/QuizInfoView',
  'views/quizzes/QuizPreviewView',
  'views/quizzes/QuizMembersLayout',
  'text!templates/quizzes/quiz-layout.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Quiz, QuizFormView, QuizAssignMembersView, QuizInfoView, QuizPreviewView, QuizMembersView, quizTpl, Utils, Constants, vent){
    var GroupLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(quizTpl),
        regions : {
            info : '.quiz-info-container',
            members : '.quiz-members-container',
        },
        
        initialize : function(options) {
            var self = this;
            this.model = new Quiz({id:options.id});
            var include = null;
            if (appUser.is(Constants.USER_TYPE_EDITOR)) {
                include = 'translations_stats';
            }
            this.model.fetch({
                async:false,
                data: { include: include},
                traditional: true,
            });
            vent.trigger('router.page.info.update',{bcs:[
              {href:'#quizzes', text:'Quizzes'}, 
              {href:'#quiz/'+this.model.id, text:qtr(this.model.get('name'))}
            ]});  

        },
        
        events : {
            'click .btn-add-quiz': 'addQuiz',
            'click .btn-edit-quiz': 'editQuiz',
            'click .btn-del-quiz': 'delQuiz',
            'click .btn-preview-quiz': 'previewQuiz',
            'click .btn-manage-quiz-members' : 'manageQuizMembers'
        },
        
        addQuiz : function() {
            var view = new QuizFormView({model:new Quiz()});
            vent.trigger('showModal', view);
        },

        editQuiz : function() {
            var view = new QuizFormView({model:this.model});
            vent.trigger('showModal', view);
        },
        
        delQuiz : function() {
            var self = this;
            alertify.confirm('Delete '+ this.model.get('name'), 'Are you sure you want to delete?', 
                function(){ self.model.destroy({
                    success: function(model, response) {
                        vent.trigger('quizzes.layout.refresh');                            
                    }
                });},
                function(){ alertify.error('Cancel');}
            );
        },

		previewQuiz: function() {
            var view = new QuizPreviewView({model:this.model});
            vent.trigger('showModal', view);
		},
		
        manageQuizMembers : function() {
            var view = new QuizAssignMembersView({model:this.model});
            vent.trigger('showModal', view);
        },

        onBeforeShow: function() {
            this.showChildView('info', new QuizInfoView({model:this.model}));
            this.showChildView('members', new QuizMembersView({model:this.model}));
        },
        templateHelpers : function() {
            return {
            };
        },
        
    });
     
    return GroupLayout;
});