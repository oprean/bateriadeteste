define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){
	var User = Backbone.Model.extend({
		urlRoot: 'api/user',
		defaults : {
			username: null,
			firstname: null,
			lastname: null,
			password: null,
			email: null,
			type: null,
			is_admin: null,
			ownUser: null,
			ownGroup: null,
			quizzes: null,
			users: null,
			permissions: null
		}
	});

	return User;
});