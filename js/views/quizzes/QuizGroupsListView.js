define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/QuizGroups',
  'views/quizzes/QuizGroupFormView',
  'text!templates/quizzes/quiz-groups-list.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, QuizGroups, QuizGroupFormView, quizGroupsListTpl, Constants, Utils, vent, globals){
  var QuizGroupsListView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizGroupsListTpl),
    events : {
        'click .btn-edit-quiz-group' : 'editQuizGroup',
        'click .btn-delete-quiz-group' : 'deleteQuizGroup',
    },
    
    initialize : function(options) {
        var self = this;
        this.quiz = options.quiz;
        this.collection = new QuizGroups();
        this.collection.fetch({
            async: false,
            data: { quizid: this.quiz.id },
            traditional: true
        });
        this.listenTo(vent, 'quizedit.layout.groups.refresh', function(){
            self.collection.fetch({ 
                async: false,
                data: { quizid: this.quiz.id },
                traditional: true
            });
            self.render();
        });
    },
    
    editQuizGroup : function(e) {
        var id = $(e.target).data('id');
        var view = new QuizGroupFormView({quiz:this.model, model:this.collection.get(id)});
        vent.trigger('showModal', view);
    },

    deleteQuizGroup : function(e) {
        var self = this;
        alertify.confirm('Delete this group?', 
            $(e.target).parent().parent().children('.group-text').html(), 
            function(){
                var id = $(e.target).data('id');
                var group = self.collection.get(id);
                group.destroy({
                    success: function() {
                        vent.trigger('quizedit.layout.groups.refresh');
                    }
                });
            },
            function(){ alertify.error('Cancel');}
        );
    },
    
    templateHelpers: function() {
        return {
            groups: this.collection.models,
            quiz: this.quiz
        };
    }
    
  });

  return QuizGroupsListView;
});