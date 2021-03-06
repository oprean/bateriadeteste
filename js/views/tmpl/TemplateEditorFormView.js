define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Template',
  'text!templates/tmpl/template-editor-form.html',
  //'text!templates/tmpl/1.html',
  'components/Utils',
  'components/Constants',
  'components/Events',
], function($, _, Backbone, Marionette, Template, editorTpl, Utils, Constants, vent){
    var TemplateEditorFormView = Backbone.Marionette.ItemView.extend({
        template : _.template(editorTpl),
        initialize : function(options) {
            var self = this;
            this.lang = 'int';
            this.options.editor = {
                int:null,ro:null,en:null
            };
        }, 

        events : {
            'submit #result-template-from' : 'previewUpdateTemplate',
            'click .btn-save-template': 'saveTemplate',
            'click .nav-tab': 'previewTemplate',
            'click .tpl-var': 'insertTVar'
        },
        
        insertTVar: function(e) {
            var tvar = $(e.target).data('tvar');  
            switch (this.lang) {
                case 'int': this.options.editor.int.execCommand('mceInsertContent', false, tvar); break;
                case 'ro': this.options.editor.ro.execCommand('mceInsertContent', false, tvar); break;
                case 'en': this.options.editor.en.execCommand('mceInsertContent', false, tvar); break;
            }

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
          this.lang = $(e.target).attr('aria-controls');  
          vent.trigger('template.preview', {model:this.model, lang:this.lang});
        },
                     
        previewUpdateTemplate: function(event) {
          event.preventDefault();
          var lang = this.$('div.tab-pane.active').attr('id');  
          var templates = {
            int_content: this.$('#int_template').val(),
            ro_content: this.$('#ro_template').val(),
            en_content: this.$('#en_template').val(),
            int_title: this.$('#int_title').val(),
            ro_title: this.$('#ro_title').val(),
            en_title: this.$('#en_title').val()
          };
            
          this.model.set(templates);
          vent.trigger('template.preview', {model:this.model, lang:lang});
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
            var paramVars = $.merge(_.pluck(Constants.GENERAL_TEMPLATE_VARIABLE,'name'),this.model.get('params').split(' '))
            return {
                paramVars : paramVars
            };
        },
    });
     
    return TemplateEditorFormView;
});