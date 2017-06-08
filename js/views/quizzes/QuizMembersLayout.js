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
            _.each(users, function(user) {
                self.sendInvitationMail(user.id,self.model.id);
            });
            this.members.fetch({
                success: function() {
                    $(e.target).button('reset');
                }
            });
        },
        
        invite: function(e) {
            var el = $(e.target);
            el.button('loading');
            this.sendInvitationMail(el.data('user-id'),this.model.id, el);
            this.members.fetch();
        },
       
        sendInvitationMail: function(userId, quizId, el) {
            $.ajax({
                url: 'api/mail/invite/'+userId+'/'+quizId,
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
                    if(el)el.button('reset');					
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

