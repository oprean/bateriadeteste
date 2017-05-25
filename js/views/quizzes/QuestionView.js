define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.marionette',
    'models/QuizQuestion',
    'models/QuizAnswer',
    'components/Utils',
    'components/Constants',
    'text!templates/quizzes/quiz-question-view.html',
    'components/Events',
], function ($, _, Backbone, Marionette, QuizQuestion, QuizAnswer, Utils, Constants, questionTpl, vent) {
    var QuestionView = Backbone.Marionette.ItemView.extend({
        template: _.template(questionTpl),
        events: {
            'change .option-answer': 'updateAnswer',
        },

        initialize: function (options) {
            var self = this;
            this.model = new QuizQuestion({
                quiz_id: options.quiz_id,
                position: options.question_no
            });

            this.model.urlRoot = 'api/quiz/' + options.quiz_id + '/question/' + options.question_no;
            this.model.fetch({
                async: false,
                success: function (question) {
                    if (question.get('answer') != null) {
                        self.answer = new QuizAnswer(question.get('answer'));
                    } else {
                        self.answer = new QuizAnswer({
                            quiz_id: question.get('quiz_id'),
                            question_id: question.id,
                        });
                    }
                }
            });

            this.answer.on("invalid", function (model, error) {
                self.$('.validationError').show();
                self.$('.validationError').html(error);
                self.$('.btn-nav-next-question').hide();
            });

            vent.trigger('router.page.info.update', {bcs: [
                    {href: '#quizzes', text: 'Quizzes', visible: appUser.hasPerm('quizzes.view')},
                    {href: '#quiz/' + this.model.get('quiz_id') + '/q/home', text: qtr(this.model.get('quiz_name'))},
                    {href: '#quiz/' + this.model.get('quiz_id') + '/q/', text: this.model.get('position')}
                ]});
        },

        templateHelpers: function () {
            return {
                button: this.getButtonsData(),
                renderOption: Utils.renderOption,
            };
        },

        getButtonsData: function () {
            var self = this;
            var progress = this.model.get('progress');
            return {
                prev: {
                    text: (progress.current > 1) ? qtr('backward') : qtr('home'),
                    icon: (progress.current > 1) ? 'glyphicon-chevron-left' : 'glyphicon-home',
                    url: (progress.current > 1) ? parseInt(progress.current) - 1 : 'home',
                    visible: (progress.current >= 1) ? true : false
                },
                next: {
                    text: (progress.current < progress.total) ? qtr('forward') : qtr('done'),
                    icon: (progress.current < progress.total) ? 'glyphicon-chevron-right' : 'glyphicon-ok',
                    url: (progress.current < progress.total) ? parseInt(progress.current) + 1 : 'validate',
                    visible: !this.answer.isNew()
                }
            };
        },

        updateAnswer: function (e) {
            var self = this;
            var optionsAnswer = [];

            _.each(this.$('.option-answer'), function (htmlOption) {
                var option = $(htmlOption);
                if (option.is("textarea")) {
                    var oid = option.data('option-id');
                    var gid = option.data('group-id');
                    var oval = option.val();
                    optionsAnswer.push({
                        option_id: oid,
                        option_val: oval,
                        group_id: gid
                    });
                } else {
                    switch (option.attr('type')) {
                        case 'radio':
                            if (option.is(':checked')) {
                                var oid = option.data('option-id');
                                var gid = option.data('group-id');
                                var oval = (option.is('input')) ? option.val() : option.text();
                                optionsAnswer.push({
                                    option_id: oid,
                                    option_val: oval,
                                    group_id: gid
                                });
                            }
                            ;
                            break;
                        case 'checkbox':
                            if (option.is(':checked')) {
                                var oid = option.data('option-id');
                                var gid = option.data('group-id');
                                var oval = (option.is('input')) ? option.val() : option.text();
                                optionsAnswer.push({
                                    option_id: oid,
                                    option_val: oval,
                                    group_id: gid
                                });
                            }
                            ;
                            break;
                        case 'text':
                            var oid = option.data('option-id');
                            var gid = option.data('group-id');
                            var oval = option.val();
                            optionsAnswer.push({
                                option_id: oid,
                                option_val: oval,
                                group_id: gid
                            });
                            break;
                    }
                    ;
                }
            });

            this.answer.set({'data': optionsAnswer});
            this.answer.save(null, {
                async: true,
                quiz_type: parseInt(this.model.get('quiz_type')),
                success: function (answer) {
                    $('.validationError').hide();
                    $('.btn-nav-next-question').show();
                }}
            );

        },
    });

    return QuestionView;
});