define([
  'jquery',
  'underscore',
  'backbone',
  'backbone.marionette',
  'collections/Settings',
  'components/Constants',
  'text!templates/quizzes/option-radio-tpl.html',
  'text!templates/quizzes/option-check-tpl.html',
  'text!templates/quizzes/option-input-tpl.html',
  'text!templates/quizzes/option-textarea-tpl.html',
  'text!templates/quizzes/result-groups-tpl.html',
  'globals',
  'moment'
], function($, _, Backbone, Marionette, Settings, Constants, 
	
	optionRadioTpl,
	optionCheckTpl,
	optionInputTpl,
	optionTextareaTpl,
	resultGroupsTpl,
	
	globals, moment ){
	
	String.prototype.ucfirst = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	};
	
	/** Converts numeric degrees to radians */
	if (typeof(Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function() {
			return this * Math.PI / 180;
		};
	}
	
	var Utils = {
		
		getTypeName: function(type) {
            switch (type) {
                case Constants.QUIZ_TYPE:return 'quiz';
                case Constants.USER_TYPE:return 'user';
                case Constants.GROUP_TYPE:return 'group';
                case Constants.OPERATION_TYPE:return 'operation';
            }    
		},
		
		getTplVarVal: function(varname, model) {
		   var tmodel = model.attributes;
		   
           switch(varname){
               case '{quiz.name}': return qtr(tmodel.quiz.name);
               case '{quiz.description}': return qtr(tmodel.quiz.description);
               
               case '{result.name}': return qtr(tmodel.result.data.result.name);
               case '{result.total}': return tmodel.result.data.result.total;
               case '{result.description}': return qtr(tmodel.result.data.result.description);
               case '{result.groups.total}': return tmodel.result.data.total;
               case '{result.groups}': {
                   var tpl = _.template(resultGroupsTpl); 
                   return tpl({groups:tmodel.result.data.groups});
               }
               case '{user.username}': return tmodel.user.username;
               case '{user.firstname}': return tmodel.user.firstname;
               case '{user.lastname}': return tmodel.user.lastname;
               case '{user.email}': return tmodel.user.email;
               default: return varname;
           }
		},
		
		prepareTemplateData: function(model) {
            var result = model.get('result').data.result;
            var group = _.findWhere(model.get('groups'),{id:result.group_id});
            result.name = group.name;
            result.description = group.description;
            _.each(model.get('result').data.groups, function(group) {
                var g = _.findWhere(model.get('groups'),{id:group.group_id});
               group.name = g.name;
               group.description = g.description;
            });		    
		},
		
		previewTemplate: function(model,lang) {
		    var clone = model.clone();
		    var groups = clone.get('groups');
		    var html = clone.get(lang+'_template')
		      ?clone.get(lang+'_template')
		      :clone.get('template')[lang];
		    html = html?html:'';
		     
            var gid = Math.floor(Math.random()*(groups.length));  
            var self = this;
            clone.set({
                quiz: {
                    name: clone.get('name')[lang],
                    description: clone.get('description')[lang]
                },
                result:{ data:{ 
                    result: {
                        name: groups[gid].name,
                        description: groups[gid].description,
                        total: 123,  
                    },
                    total: 456,
                    groups: groups},                    
                },
                user: appUser
            });
            _.each(Constants.TEMPLATE_VARIABLE, function(tvar){
                html = html.replace(tvar.name, self.getTplVarVal(tvar.name,clone));
 
            });     
            return html;
		},
		
		renderTemplate: function(model) {
            var self = this;
		    var html;
		    if (model.get('quiz').type == Constants.QUIZ_TYPE_SURVEY) {
		        html = 'srvy';
		    } else {
                html = qtr(model.get('quiz').template);            
                //this.prepareTemplateData(model);
                _.each(Constants.TEMPLATE_VARIABLE, function(tvar){
                    html = html.replace(tvar.name, self.getTplVarVal(tvar.name,model));
                });    
		    }
            	    		    
		    return html;
		},
		
		renderOption: function(option, answer) {

			var html='',template, value;
			switch(parseInt(option.type)) {
				case Constants.OPTION_TYPE_RADIO:
					template = _.template(optionRadioTpl);
					break;
				case Constants.OPTION_TYPE_CHECK:
					template = _.template(optionCheckTpl);
					break;
				case Constants.OPTION_TYPE_INPUT:
					template = _.template(optionInputTpl);
					break;
				case Constants.OPTION_TYPE_TEXTAREA:
					template = _.template(optionTextareaTpl);
					break;
				default:
					template = _.template(optionRadioTpl);
			};
			if (answer) {
                value = _.findWhere(answer.data,{option_id:parseInt(option.id)});
                value = value?value.option_val:null;			    
			}
			html = template({
				option:option, 
				answer:answer,
				value:value
			});			
			
			return html;
		},
		
		t : function(text, lang) {
            if (!text) return '';
			lang = lang?lang:app.locale;
			//lang = 'ro';
			if(typeof text === 'object') {
			    if(!text['int']) console.warn('WARNING: Missing internal translation for : ',text);
                return text[lang]?text[lang]:text['int'];			    
			} else {
			    return i18n.t(text);
			}

		},
		
        getJsonData : function(url) {
            var json;
            $.ajax({
                url : url,
                dataType: 'json',
                async: false, 
                success : function(data) {
                    json = data;
                }
            });
            return json;
        },
			
        getDefaultPermissions: function(type) {
            switch (type) {
                case Constants.QUIZ_TYPE:return Constants.DEFAULT_PERMISSIONS_FOR_QUIZ;
                case Constants.USER_TYPE:return Constants.DEFAULT_PERMISSIONS_FOR_USER;
                case Constants.GROUP_TYPE:return Constants.DEFAULT_PERMISSIONS_FOR_GROUP;
                case Constants.OPERATION_TYPE:return [];
            }
        },
			
		getPermissions : function(type, userid) {    
		    return this.getJsonData('api/permission/type/' + type +'/user/'+userid);
		},
		
        getGroupMembers : function(groupid) {    
            return this.getJsonData('api/group/'+groupid+'/members');
        },
		
		togglePermission : function(userid, permissionid) {
			var result;
			$.ajax({
				url : 'api/user/' + userid + '/permission/' + permissionid,
				dataType: 'json',
				async: false, 
				success : function(data) {
					alertify.set('notifier','position', 'top-right');
					alertify.success('Permission updated.'); 
				}
			});
			
			return result;
		},
		
		getDistance : function(lon, lat, pid) {
			point = _.findWhere(Constants.LOCATIONS, {id:pid});
			if (point) {
				var R = 6371; // Radius of the earth in km
				var dLat = (lat-point.lat).toRad();  // Javascript functions in radians
				var dLon = (lon-point.lon).toRad(); 
				var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				          Math.cos(lat.toRad()) * Math.cos(lat.toRad()) * 
				          Math.sin(dLon/2) * Math.sin(dLon/2); 
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
				var d = R * c; // Distance in km
				return d;				
			} else {
				return 0;
			}
		},
		
		getJson : function(name) {
			var quiz;
			$.ajax({
				url : 'data/' + name + '.json',
				dataType: 'json',
				async: false, 
				success : function(data) {
					quiz = data;
				}
			});
			
			return quiz;
		},
							
		bootstrapEnv: function() {
		    var envs = ['xs', 'sm', 'md', 'lg'];
		
		    $el = $('<div>');
		    $el.appendTo($('body'));
		
		    for (var i = envs.length - 1; i >= 0; i--) {
		        var env = envs[i];
		
		        $el.addClass('hidden-'+env);
		        if ($el.is(':hidden')) {
		            $el.remove();
		            return env;
		        }
		    };
		}
	};

	return Utils;
});
