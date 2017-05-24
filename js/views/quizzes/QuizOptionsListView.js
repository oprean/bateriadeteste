define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'collections/QuizOptions',
  'views/quizzes/QuizOptionFormView',
  'text!templates/quizzes/quiz-options-list.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, QuizOptions, QuizOptionFormView, quizOptionsListTpl, Constants, Utils, vent, globals){
  var QuizOptionsListView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizOptionsListTpl),
    events : {
        'click .btn-edit-quiz-option' : 'editQuizOption',
        'click .btn-delete-quiz-option' : 'deleteQuizOption',
    },
    
    initialize : function(options) {
        var self = this;
        this.collection = new QuizOptions();
        this.quiz = options.quiz;
        this.parent_id = options.parent_id;
        this.type = options.type;
        this.collection.fetch({
            async: false,
            data: {parent_id: this.parent_id, parent_type: this.type},
            traditional: true
        });
        this.listenTo(vent, 'quizedit.layout.options.refresh', function(){
        	console.log(self.quiz);
            self.collection.fetch({ 
                async: false,
                data: {parent_id: this.parent_id,parent_type: this.type},
                traditional: true
            });
            self.render();
        });
    },
    
    onRender: function() {
        var self = this;
        this.$( ".sortable-options" ).sortable({
            update: function( event, ui ) {
                self.sortOptions();
            }
        });
    },
    
    sortOptions: function() {
        var orderedOptions=[];
        _.each(this.$('.quiz-option-item'), function(option,i) {
            orderedOptions.push($(option).data('id'));
        });
        $.post('api/quiz/option/sort',{oids:orderedOptions}, function(result){
            vent.trigger('quizedit.layout.options.refresh');
        });     
    },
    
    editQuizOption : function(e) {
        var id = $(e.target).data('id');
        var view = new QuizOptionFormView({quiz:this.quiz, model:this.collection.get(id)});
        vent.trigger('showModal', view);
    },

    deleteQuizOption : function(e) {
        var self = this;
        alertify.confirm('Delete this option?', 
            $(e.target).parent().parent().children('.option-text').html(), 
            function(){
                var id = $(e.target).data('id');
                var option = self.collection.get(id);
                option.destroy({
                    success: function() {
                        vent.trigger('quizedit.layout.options.refresh');
                    }
                });
            },
            function(){ alertify.error('Cancel');}
        );
    },
    
    templateHelpers: function() {
        return {
            options: this.collection.models,
            quiz: this.quiz
        };
    }
    
  });

  return QuizOptionsListView;
});