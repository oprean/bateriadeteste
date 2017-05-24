define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Quizzes',
  'text!templates/home/normal-home-layout.html',
  'text!templates/home/assigned-quiz-row.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Quizzes, homeTpl, rowTpl, Constants, Utils, vent, globals){
  var NormalHomeLayout = Backbone.Marionette.LayoutView.extend({
    template : _.template(homeTpl),
    regions : {
        assigned : '.assigned-container',
    },
    events : {
    },
    
    initialize : function(options) {
        var self = this;
        this.quizzes = new Quizzes();
        this.quizzes.fetch({
            async:false,
            data: { include: 'status', assigned:'yes' },
            traditional: true,
            success: function(quizzes) {
            }
        });
    },
    
   renderAssignedGrid: function() {
        var self = this;
        
        Backgrid.ActionsCell = Backgrid.Cell.extend({
          className: "actions-cell",             
          render : function() {
            var tpl = _.template(rowTpl); 
            var html = tpl({quiz:this.model.attributes, Constants:Constants});
            this.$el.append(html);
            return this;
          }         
        });
        
        var columns = [
          {
            label: "",
            editable: false,
            sortable: false,
            cell: "actions",
          },
        ];
            
        var backgridView = new Backgrid.Grid({
          className: 'backgrid items table table-hover table-condensed hide-thead',
          columns: columns,
          collection: this.quizzes,
          emptyText: qtr('You have nothing ...'),
        });
        
        return backgridView;  
    },
    
    onBeforeShow: function() {
        this.showChildView('assigned', this.renderAssignedGrid());
    },
    
  });

  return NormalHomeLayout;
});