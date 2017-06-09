define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.marionette',
    'collections/Settings',
    'views/home/HomeLayout',
    'views/users/UsersLayout',
    'views/users/UserLayout',
    'views/groups/GroupsLayout',
    'views/quizzes/QuizzesLayout',
    'views/quizzes/QuizEditLayout',
    'views/quizzes/QuizTemplatesLayout',
    'views/quizzes/QuizTranslationsLayout',
    'views/quizzes/QuizHomeView',
    'views/quizzes/QuestionView',
    'views/quizzes/QuizValidateView',
    'views/quizzes/QuizResultView',
    'views/permissions/PermissionsLayout',
    'views/tmpl/TemplatesLayout',
    'views/tmpl/TemplateLayout',
    'views/profile/ProfileLayout',
    'views/admin/AdminLayout',
    'views/StaticView',
    'components/Events',
    'components/Constants',
    'globals'
], function ($, _, Backbone, Marionette, Settings, HomeLayout,
        UsersLayout, UserLayout, GroupsLayout, QuizzesLayout, QuizEditLayout, QuizTemplatesLayout, QuizTranslationsLayout, QuizHomeView, QuestionView, QuizValidateView, QuizResultView,
        PermissionsLayout, TemplatesLayout, TemplateLayout, ProfileLayout, AdminLayout, StaticView,
        vent, Constants, globals) {
    var Controller = Marionette.Controller.extend({
        initialize: function () {
            this.listenTo(vent, 'showModal', function (modalView) {
                app.rootLayout.modals.show(modalView);
            });
        },

        home: function () {
            console.log('home');
            app.rootLayout.main.show(new HomeLayout());
        },
        profile: function () {
            app.rootLayout.main.show(new ProfileLayout());
        },
        static: function (file) {
            app.rootLayout.main.show(new StaticView({tpl: file}));
        },
        users: function () {
            app.rootLayout.main.show(new UsersLayout());
        },
        user: function (id) {
            console.log('user/' + id);
            app.rootLayout.main.show(new UserLayout({id: id}));
        },
        groups: function (id) {
            console.log('group/' + id);
            app.rootLayout.main.show(new GroupsLayout({id: id}));
        },
        quizzes: function (id) {
            console.log('quizz/' + id);
            app.rootLayout.main.show(new QuizzesLayout({id: id}));
        },
        question: function (quizId, questionNo) {
            console.log('quiz: ', quizId, ' question: ', questionNo);
            var view;
            switch (questionNo) {
                case 'home':
                    view = new QuizHomeView({quiz_id: quizId});
                    break;
                case 'validate':
                    view = new QuizValidateView({quiz_id: quizId});
                    break;
                case 'result':
                    view = new QuizResultView({quiz_id: quizId});
                    break;
                default:
                    view = new QuestionView({
                        quiz_id: quizId,
                        question_no: questionNo
                    });
            }
            app.rootLayout.main.show(view);
        },
        quizedit: function (id) {
            console.log('quizz/' + id);
            app.rootLayout.main.show(new QuizEditLayout({quizid: id}));
        },
        quiztemplates: function (id) {
            console.log('quizz/' + id);
            app.rootLayout.main.show(new QuizTemplatesLayout({quizid: id}));
        },
        quiztranslations: function (id) {
            console.log('quizz/' + id);
            app.rootLayout.main.show(new QuizTranslationsLayout({quizid: id}));
        },
        permissions: function () {
            app.rootLayout.main.show(new PermissionsLayout());
        },
        tmpls: function () {
            app.rootLayout.main.show(new TemplatesLayout());
        },
        tmpl: function (id) {
            app.rootLayout.main.show(new TemplateLayout({id:id}));
        },
        admin: function (section) {
            console.log('admin');
            app.rootLayout.main.show(new AdminLayout({section: section}));
        },

    });

    return Controller;
});