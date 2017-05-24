define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'text!templates/quizzes/quiz-template-editor-form.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, editorTpl, Utils, Constants, vent){
    var QuizTemplateEditorFormView = Backbone.Marionette.ItemView.extend({
        template : _.template(editorTpl),
        initialize : function(options) {
            var self = this;
            this.options.editor = {
                int:null,ro:null,en:null
            };
        }, 

        events : {
            'submit #result-template-from' : 'previewUpdateTemplate',
            'click .btn-save-template': 'saveTemplate',
            'click .nav-tab': 'previewTemplate'
        },
          
        saveTemplate: function() {
            this.model.save(null,{
                success: function() {
                    alertify.success('Template saved');
                },error: function() {
                    alertify.success('Failed to save template!');
                }
            });
        },
        
        previewTemplate: function(e) {
          var lang = $(e.target).attr('aria-controls');  
          vent.trigger('quiz.template.preview', {model:this.model, lang:lang});
        },
                     
        previewUpdateTemplate: function(event) {
          event.preventDefault();
          var lang = this.$('div.tab-pane.active').attr('id');  
          var templates = {
            int_template: this.$('#int_template').val(),
            ro_template: this.$('#ro_template').val(),
            en_template: this.$('#en_template').val()
          };
            
          this.model.set(templates);
          vent.trigger('quiz.template.preview', {model:this.model, lang:lang});
        },
                           
        onAttach: function() {
           var self = this;
           tinymce.init({
            selector: '#int_template',
            height: 300,
            plugins: ['code','image'],
            setup: function(editor){self.options.editor.int = editor;}
          });
          
          tinymce.init({
            selector: '#ro_template',
            height: 300,
            plugins: ['code','image'],
            setup: function(editor){ self.options.editor.ro = editor;}
          });  
          
          tinymce.init({
            selector: '#en_template',
            height: 300,
            plugins: ['code','image'],
            setup: function(editor){ self.options.editor.en = editor;}
          });
        },

        onBeforeDestroy: function() {
            console.log('destroy', this);
            tinymce.remove(this.options.editor.int);
            tinymce.remove(this.options.editor.ro);
            tinymce.remove(this.options.editor.en);
        },
                           
        templateHelpers: function() {
            return {
                Constants : Constants
            };
        },
    });
     
    return QuizTemplateEditorFormView;
});