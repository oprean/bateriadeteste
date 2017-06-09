define([
    'jquery',
    'underscore',
    'backbone',
    'components/Constants',
    'text!templates/tmpl/template-form.html',
    'components/Events',
    'backbone.modal',
], function ($, _, Backbone, Constants, groupFormTpl, vent) {
    var TemplateFormView = Backbone.Modal.extend({
        template: _.template(groupFormTpl),
        submitEl: '.btn-submit',
        cancelEl: '.btn-cancel',

        initialize: function () {
            var self = this;
            this.realModel = this.model;
            this.model = this.realModel.clone();
        },

        onShow: function () {
            Backbone.Validation.bind(this);
        },

        fillModel: function (model) {
            model.set({
                name: $('#name').val(),
                title: $('#title').val(),
                description: $('#description').val(),
                params: $('#params').val(),
                type: $('#type').val(),
            });
        },

        templateHelpers: function () {
            return {
                types: Constants.TEAMPLATE_TYPES
            };
        },

        beforeSubmit: function () {
            this.fillModel(this.model);
            return this.model.isValid(true);
        },

        submit: function () {
            this.fillModel(this.realModel);
            this.model.save(null, {
                success: function (model) {
                    vent.trigger('groups.layout.refresh');
                },
            });
        }
    });

    return TemplateFormView;
});