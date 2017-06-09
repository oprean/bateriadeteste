define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'text!templates/tmpl/template-preview.html',
  'components/Utils',
  'components/Events',
], function($, _, Backbone, Marionette, previewTpl, Utils, vent){
    var TemplatePreviewView = Backbone.Marionette.ItemView.extend({
        template : _.template(previewTpl),
        initialize : function(options) {
            var self = this;
            this.lang = 'int';
            this.listenTo(vent, 'template.preview', function(options){
                self.model = options.model;
                self.lang = options.lang;
                this.render();
            });
        }, 

        templateHelpers: function() {
            var self = this;
            var html = Utils.previewTemplate(this.model,this.lang);
            return {
                'html': html,
                'title': this.model.get(this.lang+'_title')
            };
        },
    });
     
    return TemplatePreviewView;
});