define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'models/Generic',
  'text!templates/home/results-filter-form.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Settings, Generic, filterTpl, Constants, Utils, vent, globals){
  var ResultsFilterView = Backbone.Marionette.ItemView.extend({
    template : _.template(filterTpl),
    events : {
        'click .btn-filter-results' : 'filterResults'
    },
    
    initialize : function(options) {
        var self = this;
        this.model = new Generic();
        this.model.url = 'api/quiz/results/filter';
        this.model.fetch({
            async:false,
            success: function(quizzes) {
                console.log(quizzes);
                self.render();
            }
        });
    },

    filterResults: function() {
        var filter = {
            user:this.$('.select-filter-by-user').val(),
            group:this.$('.select-filter-by-group').val(),
            quiz:this.$('.select-filter-by-quiz').val() 
        };
        
        this.$('.btn-download-xls').attr('href','api/excel/result/'+app.locale+'/'+filter.user+'/'+filter.group+'/'+filter.quiz);
        
        vent.trigger('filter.results', {filter:filter});
    },
    
    onRender: function() {
      this.$('.select-filter-by-quiz').select2();
      this.$('.select-filter-by-group').select2();
      this.$('.select-filter-by-user').select2();  
    },

    templateHelpers: function() {
        return {
            Constants : Constants
        };
    }
    
  });

  return ResultsFilterView;
});