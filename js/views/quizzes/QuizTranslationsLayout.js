define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'models/Quiz',
  'collections/Generics',
  'models/Generic',
  'text!templates/quizzes/quiz-translations-layout.html',
  'components/Utils',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, Quiz, Generics, Generic, quizTpl, Utils, vent){
    var QuizTranslationsLayout = Backbone.Marionette.LayoutView.extend({
        template : _.template(quizTpl),
        regions : {
            intLang : '.int-container',
            roLang : '.ro-container',
            enLang : '.en-container'
        },
        
        events: {
            'click .btn-copy-lang': 'copyLang',
            'click .btn-clear-lang': 'clearLang'
        },
        
        initialize : function(options) {
            var self = this;
            this.model = new Quiz({id:options.quizid});
            this.model.fetch({
                async: false,
                data: { include: 'translations' },
                traditional: true
            });
            vent.trigger('router.page.info.update',{bcs:[
              {href:'#quizzes', text:'Quizzes'}, 
              {href:'#quiz/'+this.model.id, text:qtr(this.model.get('name'))},
              {href:'#quiz/'+this.model.id+'/template', text:'Translations'}
            ]});
        },
       
        copyLang: function(e) {
            var self = this;
            var from = $(e.target).data('lang-from');
            var lang = $(e.target).data('lang');
            alertify.confirm('Copy language', 'Are you sure you want to copy ALL from "'+from+'" to "'+lang+'" language?', 
                function(){
                    $.get('api/translation/copy/'+self.model.id+'/'+from+'/to/'+lang, function(){
                        self.model.fetch({
                            async: false,
                            data: { include: 'translations' },
                            traditional: true
                        });
                        self.showChildView(lang+'Lang', self.renderTranslationsGrid(lang));               
                    });
                },
                function(){ alertify.error('Cancel');}
            );
        },

        clearLang: function(e) {
            var self = this;
            var lang = $(e.target).data('lang');
            
            alertify.confirm('Clear language', 'Are you sure you want to clear ALL "'+lang+'" language?', 
                function(){
                    $.get('api/translation/delete/'+self.model.id+'/from/'+lang, function(){
                        self.model.fetch({
                            async: false,
                            data: { include: 'translations' },
                            traditional: true
                        });
                        self.showChildView(lang+'Lang', self.renderTranslationsGrid(lang));
                    }); 
                },
                function(){ alertify.error('Cancel');}
            );
        },
       
        templateHelpers : function() {
            return {
                Constants : Constants
            };
        },
        
        renderTranslationsGrid: function(lang) {
            var self = this;                           
            var columns = [];
           
            columns.push({
                name: "text",
                label: "Text",
                editable: true,
                sortable: false,
                cell: "string",    
            });
            columns.push({
                name: "field",
                label: "Field",
                editable: false,
                sortable: false,
                cell: "string",    
            });
            columns.push({
                name: "table",
                label: "Type",
                editable: false,
                sortable: false,
                cell: "string",    
            });
            
            var langList;
            switch(lang) {
                case 'int':langList = this.model.get('translations').intList;break;
                case 'ro':langList = this.model.get('translations').roList;break;
                case 'en':langList = this.model.get('translations').enList;break;
            }
         
            var backgridView = new Backgrid.Grid({
              className: 'backgrid items table table-striped table-bordered table-hover table-condensed',
              columns: columns,
              collection: new Generics(langList),
              emptyText: "A man without history is a tree without roots.",
            });
            
            return backgridView;
        },
        
        onBeforeShow: function() {
            this.showChildView('intLang', this.renderTranslationsGrid('int'));                
            this.showChildView('roLang', this.renderTranslationsGrid('ro'));
            this.showChildView('enLang', this.renderTranslationsGrid('en'));
        },      
    });

    return QuizTranslationsLayout;
});