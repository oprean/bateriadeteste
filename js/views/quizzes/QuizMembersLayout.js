define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'models/Quiz',
  'collections/Generics',
  'models/Generic',
  'text!templates/quizzes/quiz-assigned-members-layout.html',
  'text!templates/quizzes/assigned-member-action-row.html',
  'components/Utils',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, Quiz, Generics, Generic, quizMembersTpl, actionsRowTpl, Utils, vent){
    var QuizMembersLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(quizMembersTpl),
        regions : {
            members : '.members-list-container',
        },
        
        events: {
            'click .btn-copy-lang': 'copyLang',
            'click .btn-clear-lang': 'clearLang'
        },
        
        initialize : function(options) {
            var self = this;
            this.model = options.model;
        },     
       
        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },
        
        renderMembersGrid: function() {
            var self = this;                           
            var columns = [];
           
            Backgrid.ActionsCell = Backgrid.Cell.extend({
              className: "actions-cell",             
              render : function() {
                var tpl = _.template(actionsRowTpl); 
                var html = tpl({userid:this.model.id, quizid:self.model.id, Constants:Constants});
                this.$el.append(html);
                return this;
              }         
            });
           
            columns.push({
                name: "username",
                label: "Username",
                editable: true,
                sortable: false,
                cell: "string",    
            });
            columns.push({
                name: "email",
                label: "E-mail",
                editable: false,
                sortable: false,
                cell: "string",    
            });
            columns.push({
                name: "firstname",
                label: "First name",
                editable: false,
                sortable: false,
                cell: "string",    
            });
            columns.push({
                name: "lastname",
                label: "Last name",
                editable: false,
                sortable: false,
                cell: "string",    
            });
            
            columns.push({
                label: "",
                editable: false,
                sortable: false,
                cell: "actions",
            });
            
            var members = this.model.get('members');
            
         
            var backgridView = new Backgrid.Grid({
              className: 'backgrid items table table-striped table-bordered table-hover table-condensed',
              columns: columns,
              collection: new Generics(members),
              emptyText: "A man without history is a tree without roots.",
            });
            
            return backgridView;
        },
        
        onBeforeShow: function() {
            this.showChildView('members', this.renderMembersGrid());
        },      
    });

    return QuizMembersLayout;
});

