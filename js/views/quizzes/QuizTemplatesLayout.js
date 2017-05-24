define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'models/Quiz',
  'views/quizzes/QuizTemplateEditorFormView',
  'views/quizzes/QuizTemplatePreviewView',
  'text!templates/quizzes/quiz-templates-layout.html',
  'components/Utils',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, Quiz, QuizTemplateEditorFormView, QuizTemplatePreviewView, quizTpl, Utils, vent){
    var QuizTemplatesLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(quizTpl),
        regions : {
            editor : '.template-editor-container',
            preview : '.template-preview-container',
        },
        
        events: {
        },
        
        initialize : function(options) {
            var self = this;
            this.model = new Quiz({id:options.quizid});
            this.model.fetch({
                async: false,
                data: { include: 'groups' },
                traditional: true
            });
            vent.trigger('router.page.info.update',{bcs:[
              {href:'#quizzes', text:'Quizzes'}, 
              {href:'#quiz/'+this.model.id, text:qtr(this.model.get('name'))},
              {href:'#quiz/'+this.model.id+'/template', text:'Templates'}
            ]});
        },
       
        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },
        
        onBeforeShow: function() {
            this.showChildView('editor', new QuizTemplateEditorFormView({model:this.model}));                
            this.showChildView('preview', new QuizTemplatePreviewView({model:this.model}));
        },      
    });

    return QuizTemplatesLayout;
});