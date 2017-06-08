define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'models/Template',
  'collections/Templates',
  'views/tmpl/TemplateFormView',
  'text!templates/tmpl/templates-layout.html',
  'text!templates/tmpl/template-action-row.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Template, Templates, TemplateFormView, templatesTpl, rowTpl, Constants, Utils, vent, globals){
  var TemplatesLayout = Backbone.Marionette.LayoutView.extend({
    template : _.template(templatesTpl),
    regions : {
        templates : '.templates-list-container',
    },
    events : {
        'click .btn-new-template': 'newTemplate'
    },
    
    initialize : function(options) {
        var self = this;
        this.templates = new Templates();
        this.templates.fetch({
            async:false,
        });
        vent.trigger('router.page.info.update',{bcs:[
            {href:'#templates', text:qtr('templates')}
        ]});
    },
    
    newTemplate: function () {
        vent.trigger('showModal', new TemplateFormView({model: new Template()}));
    },
    
   renderTemplatesGrid: function() {
        var self = this;
        var TemplateRow = Backgrid.Row.extend({
                events: {
                    click: 'details',
                },
                details: function () {
                    app.router.navigate('/template/' + this.model.id, {trigger: true});
                }
            });
        Backgrid.ActionsCell = Backgrid.Cell.extend({
          className: "actions-cell",             
          render : function() {
            var tpl = _.template(rowTpl); 
            var html = tpl({tmpl:this.model.attributes, Constants:Constants});
            this.$el.append(html);
            return this;
          }         
        });
        
        var columns = [
          {
            label: "name",
            name:"name",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "description",
            name:"description",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "type",
            name:"type",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "",
            editable: false,
            sortable: false,
            cell: "actions",
          },
        ];
            
        var backgridView = new Backgrid.Grid({
          className: 'backgrid items table table-hover table-condensed hide-thead',
          row: TemplateRow,
          columns: columns,
          collection: this.templates,
          emptyText: qtr('You have nothing ...'),
        });
        
        return backgridView;  
    },
    
    onBeforeShow: function() {
        this.showChildView('templates', this.renderTemplatesGrid());
    },
    
  });

  return TemplatesLayout;
});