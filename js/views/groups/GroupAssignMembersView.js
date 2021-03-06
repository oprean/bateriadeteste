define([
  'jquery',
  'underscore',
  'backbone',
  'components/Constants',
  'text!templates/groups/group-assign-members.html',
  'components/Events',
  'backbone.modal',
], function($, _, Backbone, Constants, groupTpl, vent){
	var GroupMembersView = Backbone.Modal.extend({
		template: _.template(groupTpl),
		submitEl: '.btn-submit',
		cancelEl: '.btn-cancel',

		events: {
			'click .btn-update':'updateGroup',	
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
			$.get('api/group/'+this.model.id+'/members', function(data) {
				self.model.set({
					assigned: data.assigned,
					unassigned: data.unassigned
				});
				self.render();	
			});			
		},
		
		updateGroup : function(e) {
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
					url: 'api/group/'+this.model.id+'/members',
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
			vent.trigger('groups.layout.refresh');
		}				
	});

	return GroupMembersView;
});