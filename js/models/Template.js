define([
    'jquery',
    'underscore',
    'backbone',
], function ($, _, Backbone) {
    var Template = Backbone.Model.extend({
        urlRoot: 'api/template',
        defaults: {
            id: null,
            name: null,
            title: null,
            description: null,
            params: null,
            type: null,
            
            int_content: null,
            ro_content: null,
            en_content: null,
            
            int_title: null,
            ro_title: null,
            en_title: null,
        }
    });

    return Template;
});