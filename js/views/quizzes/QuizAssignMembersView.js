define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'text!templates/quizzes/quiz-assign-members.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, quizAssignTpl, vent){
	var GroupMembersView = Backbone.Modal.extend({
		template: _.template(quizAssignTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		events: {
			'click .btn-update':'updateQuiz',	
		},

		initialize : function() {
			var self = this;
			
			this.model.set({
				assigned: [],
				unassigned: []
			});
			
			this.realModel = this.model;
			this.model = this.realModel.clone();
			console.log(this.model);
			$.get('api/quiz/'+this.model.id+'/assigned', function(data) {
				self.model.set({
					assigned: data.assigned,
					unassigned: data.unassigned
				});
				self.render();	
			});			
		},
		
		updateQuiz : function(e) {
			var self = this;			
			var action = $(e.target).data('action');
			var uids = new Array;
			if (action == 'assign') {
			    $("#unassigned option").each(function() {
			    	if (this.selected) uids.push(this.value);
			    });				
			} else {
			    $("#assigned option").each(function() {
			    	if (this.selected) uids.push(this.value);
			    });
			}
		    if (uids) {
				$.ajax({
					type: "POST",
					dataType: "json",
					url: 'api/quiz/'+this.model.id+'/assigned',
					beforeSend: function() {
						self.$('.tts_status').html('talking ...');
					}, 
					complete: function() {
						self.$('.tts_status').html('done talking!');
						self.initialize();
					},
					data: {
			    		gid: this.model.id,
			    		uids: uids,
			    		action: action
			    	}, 
				});
		    };
		},
					
		submit: function() {
			vent.trigger('quizzes.layout.refresh');
		}				
	});

	return GroupMembersView;
});