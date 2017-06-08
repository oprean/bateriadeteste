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
            description: null,
            params: null,
            type: null,
            int: null,
            ro: null,
            en: null,

        }
    });

    return Template;
});