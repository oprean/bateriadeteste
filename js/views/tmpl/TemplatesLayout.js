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
        'click .btn-tmpl-view': 'viewTemplate',
        'click .btn-tmpl-new': 'newTemplate',
        'click .btn-tmpl-edit' : 'editTemplate',
        'click .btn-tmpl-del' : 'delTemplate'
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
    
        this.listenTo(vent, 'templates.grid.refresh', function () {
            self.templates.fetch({
                success: function (collection) {
                    self.showChildView('templates', self.renderTemplatesGrid());
                }
            });
        });
    },

    viewTemplate: function (e) {
        app.router.navigate('/template/' + $(e.target).data('tmpl-id'), {trigger: true});
    },
    
    newTemplate: function () {
        vent.trigger('showModal', new TemplateFormView({model: new Template()}));
    },
    
    editTemplate: function (e) {
        e.stopPropagation();
        vent.trigger('showModal', new TemplateFormView({
            model: this.templates.get($(e.target).data('tmpl-id'))
        }));
    },
    
    delTemplate: function (e) {
        e.stopPropagation();
        var tmpl = this.templates.get($(e.target).data('tmpl-id'));
        tmpl.destroy({
            success: function() {
                vent.trigger('templates.grid.refresh');
            }
        })
    },
    
   renderTemplatesGrid: function() {
        var self = this;
        var TemplateRow = Backgrid.Row.extend({
            events: {
                //click: 'details',
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
            label: "Name",
            name:"name",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "System name",
            name:"system",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "Description",
            name:"description",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "Type",
            name:"type",
            editable: false,
            sortable: false,
            cell: "string",
          },
          {
            label: "Params",
            name:"params",
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
          className: 'backgrid items table table-hover table-condensed',
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