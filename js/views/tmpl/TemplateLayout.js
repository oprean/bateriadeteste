define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'models/Template',
  'views/tmpl/TemplateEditorFormView',
  'views/tmpl/TemplatePreviewView',
  'text!templates/quizzes/quiz-templates-layout.html',
  'components/Utils',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, Template, TemplateEditorFormView, TemplatePreviewView, tmplTpl, Utils, vent){
    var QuizTemplatesLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(tmplTpl),
        regions : {
            editor : '.template-editor-container',
            preview : '.template-preview-container',
        },
        
        events: {
        },
        
        initialize : function(options) {
            var self = this;
            this.model = new Template({id:options.id});
            this.model.fetch({
                async: false,
            });
            vent.trigger('router.page.info.update',{bcs:[
                {href:'#templates', text:qtr('templates')},
                {href:'#templates/'+this.model.id, text:this.model.get('name')}
            ]});
        },
       
        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },
        
        onBeforeShow: function() {
            this.showChildView('editor', new TemplateEditorFormView({model:this.model}));                
            this.showChildView('preview', new TemplatePreviewView({model:this.model}));
        },      
    });

    return QuizTemplatesLayout;
});