define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.marionette',
    'components/Controller',
    'text!templates/common/breadcrumbs.html',
    'components/Constants',
    'components/Events',
    'globals'
], function ($, _, Backbone, Marionette, Controller, breadcrumbsTpl, Constants, vent, globals) {
    var controller = new Controller();
    var Router = Marionette.AppRouter.extend({

        initialize: function () {
            this.listenTo(vent, 'router.page.info.update', function (data) {
                var template = _.template(breadcrumbsTpl);
                $('.breadcrumbs-container').html(template({bcs: data.bcs}));
                //var title = ['Home'];
                var title = [];
                _.each(data.bcs, function (bc) {
                    title.push(bc.text);
                });
                title = i18n.t('app_name') + ' | ' + title.join(' | ');
                document.title = title;
                $('.breadcrumbs-container').html(template({bcs: data.bcs}));
            });
        },

        controller: controller,
        appRoutes: {
            '': 'home',
            'profile': 'profile',
            'admin(/:section)': 'admin',
            'users': 'users',
            'user/:id': 'user',

            'groups': 'groups',
            'group/:id': 'groups',

            'quizzes': 'quizzes',
            'quiz/:id': 'quizzes',
            'quiz/:id/q/:no': 'question',
            'quiz/:id/edit': 'quizedit',
            'quiz/:id/template': 'quiztemplates',
            'quiz/:id/translate': 'quiztranslations',

            'templates': 'tmpls',
            'template/:id': 'tmpl',

            'permissions': 'permissions',
            //'permission/:id': 'permission',

            'static/:template': 'static',
        }
    });
    return Router;
});