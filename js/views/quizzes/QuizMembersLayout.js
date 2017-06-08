define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'models/Quiz',
  'collections/Generics',
  'models/Generic',
  'text!templates/quizzes/quiz-members-layout.html',
  'text!templates/quizzes/member-action-row.html',
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
            'click .btn-invite': 'invite',
            'click .btn-invite-all': 'inviteAll',
            'click .btn-result': 'clearLang'
        },
        
        initialize : function(options) {
            var self = this;
            this.model = options.model;
            this.members = new Generics();
            this.members.url = 'api/quiz/'+this.model.id+'/members';
            this.members.fetch({
                success: function(members) {
                    self.members = members
                }
            })
        },     
       
        inviteAll: function(e) {
            var self = this;
            var users = this.backgridView.getSelectedModels();
            $(e.target).button('loading');
            var data = {
                quizId: this.model.id,
                userIds: _.pluck(users, 'id')
            }
            $.ajax({
                type: 'POST',
                url: 'api/mail/invite',
                data: data,
                dataType: 'json',
                success: function(result) {
                    if (result.status == 'success') {
                        self.members.fetch({
                            success: function(members) {
                                alertify.success(result.data.message);
                            }
                        })
                    } else {
                        alertify.error(result.data.message);
                    }
                },
                error: function() {
                    alertify.error(qtr('internal server error!'));
                },
                complete: function() {
                    $(e.target).button('reset');					
                }
            });
        },
        
        invite: function(e) {
            $(e.target).button('loading');
            $.ajax({
                url: 'api/mail/invite/'+$(e.target).data('user-id')+'/'+this.model.id,
                success: function(result) {
                    if (result.status == 'success') {
                        alertify.success(result.data.message);
                    } else {
                        alertify.error(result.data.message);
                    }
                },
                error: function() {
                    alertify.error(qtr('internal server error!'));
                },
                complete: function() {
                    $(e.target).button('reset');					
                }
            });
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
                var html = tpl({member:this.model.attributes, quizid:self.model.id, Constants:Constants});
                this.$el.append(html);
                return this;
              }         
            });
           
           
            columns.push({
                name: "",
                cell: "select-row",
                headerCell: "select-all",
            });
            columns.push({
                name: "username",
                label: "Username",
                editable: false,
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
         
            this.backgridView = new Backgrid.Grid({
              className: 'backgrid items table table-striped table-hover table-condensed',
              columns: columns,
              collection: this.members,
              emptyText: "A man without history is a tree without roots.",
            });
            
            return this.backgridView;
        },
        
        onBeforeShow: function() {
            this.showChildView('members', this.renderMembersGrid());
        },      
    });

    return QuizMembersLayout;
});

