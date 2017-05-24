define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/Quizzes',
  'collections/Generics',
  'views/quizzes/QuizResultPreview',
  'views/home/ResultsFilterView',
  'text!templates/home/admin-dashboard-layout.html',
  'text!templates/home/actions-row.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Quizzes, Generics, QuizResultPreview, ResultsFilterView, homeTpl, actionsRowTpl, Constants, Utils, vent, globals){
  var AdminDashboardView = Backbone.Marionette.LayoutView.extend({
    template : _.template(homeTpl),
    regions : {
        filter : '.results-filter-container',
        results : '.results-container',
        assigned : '.assigned-container',
        details : '.result-details-container',
    },
    events : {

    },
    
    alert : function() {
        alertify.alert('Ready!');
        alertify.notify('sample', 'success', 5, function(){  console.log('dismissed'); });
    },
    
    initialize : function(options) {
        var self = this;
        this.results = new Generics();
        this.results.url = 'api/quiz/result';
        this.results.fetch({
            async:false,
            success: function() {
                self.render();
            }
        });
        
        this.quizzes = new Quizzes();
        this.quizzes.fetch({
            async:false,
            data: { include: 'status', assigned:'yes' },
            traditional: true,
            success: function(quizzes) {
                console.log(quizzes);
            }
        });
        
        this.listenTo(vent, 'filter.results', function(options){
            console.log(options.filter);
            this.results.fetch({
                data: options.filter,
                traditional: true,
                success: function() {
                    self.renderResultsGrid();
                }
            });
        });
    },
    
    renderAssignedGrid: function() {
        var self = this;
        
        Backgrid.ActionsCell = Backgrid.Cell.extend({
          className: "actions-cell",             
          render : function() {
            var tpl = _.template(actionsRowTpl); 
            var html = tpl({quiz:this.model.attributes, Constants:Constants});
            this.$el.append(html);
            return this;
          }         
        });
        
        var columns = [
          {        
            label: "Name",
            name: "name",
            editable: false,
            sortable: false,
            cell: Backgrid.StringCell.extend({
                render : function() {
                  this.$el.append(qtr(this.model.get('name')));
                  return this;
                },
            })
          },
          {
            label: "",
            name: "actions",
            editable: false,
            sortable: false,
            cell: "actions",
          },
        ];
            
        var backgridView = new Backgrid.Grid({
          className: 'backgrid items table table-hover table-condensed',
          columns: columns,
          collection: this.quizzes,
          emptyText: qtr('You have nothing ...'),
        });
        
        return backgridView;  
    },
    
    renderResultsGrid: function() {
        var self = this;                
        var ResultRow = Backgrid.Row.extend({
          //className: 'result-row',  
          /*events: {
            click: 'details',
          },
          details: function() {
            self.showChildView('details', new QuizResultPreview({result_id: this.model.id}));
          }*/
        }); 
        
        Backgrid.ActionsCell = Backgrid.Cell.extend({
          className: "actions-cell",
          events: {
              'click .btn-preview':'previewResult',
              'click .btn-delete':'deleteResult',
          },
          
          previewResult: function() {
            var view = new QuizResultPreview({result_id: this.model.id});
            vent.trigger('showModal', view);
          },
          
          deleteResult: function() {
          	var self = this;
			alertify.confirm('Delete result', 'Are you sure you want to delete this result?', 
                function(){ self.model.destroy({
                        success: function(){
                        	alertify.success('Result deleted!');
                        }
                    });              
                },
                function(){ alertify.error('Cancel');}
            );
          },
                  
          render : function() {
            var html = '<div class="text-center">';
            html += '<button class="btn btn-primary btn-xs btn-preview"><i class="fa fa-eye" aria-hidden="true"></i> View</button> ';
            html += '<a href="api/pdf/result/'+this.model.id+'/'+app.locale+'" class="btn btn-primary btn-xs btn-download-pdf"><i class="fa fa-file-pdf-o" aria-hidden="true"></i> PDF</a> ';
            
            if (appUser.isAdmin) {
            	html += '<button class="btn btn-danger btn-xs btn-delete"><i class="fa fa-trash-o" aria-hidden="true"></i> Delete</button> ';            	
            }

            html += '</div>';
            this.$el.append(html);
            return this;
          }         
        });
        
        var columns = [
          {
            label: "User",
            name: "user",
            editable: false,
            sortable: false,        
            cell: "string"
          },
          {        
            label: "Quiz",
            name: "quiz",
            editable: false,
            sortable: false,
            cell: Backgrid.StringCell.extend({
                render : function() {
                  this.$el.append(qtr(this.model.get('quiz')));
                  return this;
                },
            })
          },
          {
            label: "Date",
            name: "created",
            editable: false,
            sortable: false,
            cell: "string"
          },
          {
            label: "",
            name: "actions",
            editable: false,
            sortable: false,
            cell: "actions",
          },
        ];
            
        var backgridView = new Backgrid.Grid({
          className: 'backgrid items table table-hover table-condensed',
          row: ResultRow,
          columns: columns,
          collection: this.results,
          emptyText: "A man without history is a tree without roots.",
        });
        return backgridView;  
    },
    
    onBeforeShow: function() {
        this.showChildView('filter', new ResultsFilterView());
        this.showChildView('results', this.renderResultsGrid());
        this.showChildView('assigned', this.renderAssignedGrid());
    },    
  });

  return AdminDashboardView;
});