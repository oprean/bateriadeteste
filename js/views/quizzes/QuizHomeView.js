define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'models/Quiz',
  'collections/Settings',
  'text!templates/quizzes/quiz-home.html',
  'components/Constants',
  'components/Utils',
  'components/Events',
  'globals',
], function($, _, Backbone, Marionette, Quiz, Settings, quizInfoTpl, Constants, Utils, vent, globals){
  var QuizHomeView = Backbone.Marionette.ItemView.extend({
    template : _.template(quizInfoTpl),
    events : {

    },
    
    initialize : function(options) {
        this.model = new Quiz({id:options.quiz_id});
            console.log(this.model);
            this.model.fetch({
                async:false,
                data: { user_id: appUser.id },
                traditional: true
            });
        vent.trigger('router.page.info.update',{bcs:[
          {href:'#quizzes', text:'Quizzes', visible: appUser.hasPerm('quizzes.view')}, 
          {href:'#quiz/'+this.model.id+'/q/home', text:qtr(this.model.get('name'))},
          {href:'#quiz/'+this.model.id+'/q/home', text:qtr('Start')},
        ]});
    },
    
    templateHelpers: function() {
        return {
        };
    }
    
  });

  return QuizHomeView;
});