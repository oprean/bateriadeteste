define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){
	var Quiz = Backbone.Model.extend({
		urlRoot: 'api/quiz', 
		defaults : {
			id: null,
            name: {int:null, ro:null, en:null},
            description: {int:null, ro:null, en:null},
            template: {int:null, ro:null, en:null},
			type: null,
			active: null,
			created: null,
			modified: null
		}
	});

	return Quiz;
});