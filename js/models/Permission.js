define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone){
	var Permission = Backbone.Model.extend({
		urlRoot: 'api/permission',
		defaults : {
			id : null,
			name : null,
			type : null,
			description : null, 
		}
	});

	return Permission;
});