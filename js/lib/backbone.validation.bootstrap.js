// Extend the callbacks to work with Bootstrap, as used in this example
// See: http://thedersen.com/projects/backbone-validation/#configuration/callbacks
define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.validation'
], function($, _, Backbone){
	_.extend(Backbone.Validation.callbacks, {
	    valid: function (view, attr, selector) {
	        var $el = view.$('[name=' + attr + ']'), 
	            $group = $el.closest('.form-group');
	        
	        $group.removeClass('has-error');
	        $group.find('.help-block').html('').addClass('hidden');
	    },
	    invalid: function (view, attr, error, selector) {
	        var $el = view.$('[name=' + attr + ']'), 
	            $group = $el.closest('.form-group');
	        
	        $group.addClass('has-error');
	        $group.find('.help-block').html(error).removeClass('hidden');
	    }
	});
});
