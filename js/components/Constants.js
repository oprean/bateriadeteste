define([
], function () {
    var Constants =
            /*{JSON-START}*/
                    {
                        "APP_NAME": "Bateria de teste",

                        "USER_TYPE_ADMIN": "admin",
                        "USER_TYPE_LEADER": "leader",
                        "USER_TYPE_EDITOR": "editor",
                        "USER_TYPE_TRANSLATOR": "translator",
                        "USER_TYPE_NORMAL": "normal",
                        "USER_TYPE_GUEST": "guest",

                        "USER_TYPES": [
                            "admin",
                            "leader",
                            "editor",
                            "translator",
                            "normal",
                            "guest"
                        ],

                        "QUIZ_TYPE_SURVEY": 0,
                        "QUIZ_TYPE_GIFTS": 1,
                        "QUIZ_TYPE_LOVE": 2,
                        "QUIZ_TYPE_BELBIN": 3,

                        "QUIZ_TYPES": [
                            {"id": 0, "label": "Survey"},
                            {"id": 1, "label": "Common options (gifts)"},
                            {"id": 2, "label": "Question options (love)"},
                            {"id": 3, "label": "Belbin"}
                        ],

                        "QUIZ_OPTION_QUIZ_TYPE": 0,
                        "QUIZ_OPTION_QUESTION_TYPE": 1,

                        "OPERATION_TYPE": 0,
                        "GROUP_TYPE": 1,
                        "QUIZ_TYPE": 2,
                        "USER_TYPE": 3,

                        "DEFAULT_PERMISSIONS_FOR_GROUP": ["view", "edit", "delete", "member"],
                        "DEFAULT_PERMISSIONS_FOR_QUIZ": ["view", "edit", "delete", "assign", "translate", "assigned"],
                        "DEFAULT_PERMISSIONS_FOR_USER": ["view", "edit", "delete", "quota"],

                        "PERMISSION_TYPES": [
                            {"name": "operation", "value": 0},
                            {"name": "group", "value": 1},
                            {"name": "quizz", "value": 2},
                            {"name": "user", "value": 3}
                        ],

                        "OPTION_TYPE_RADIO": 0,
                        "OPTION_TYPE_CHECK": 1,
                        "OPTION_TYPE_INPUT": 2,
                        "OPTION_TYPE_TEXTAREA": 3,

                        "OPTION_TYPES": [
                            {"id": 0, "label": "radio"},
                            {"id": 1, "label": "check"},
                            {"id": 2, "label": "input"},
                            {"id": 3, "label": "textarea"}
                        ],
                        
                        "TEAMPLATE_TYPE_MAIL":"mail",
                        "TEAMPLATE_TYPE_PAGE":"page",
                        
                        "TEAMPLATE_TYPES":[
                            {"id": "mail", "text": "Mail"},
                            {"id": "page", "text": "Page"}
                        ],

                        "TEMPLATE_VARIABLE": [
                            {"name": "{quiz.name}", "description": "Quiz name"},
                            {"name": "{quiz.description}", "description": "Quiz description"},

                            {"name": "{result.name}", "description": "Result top group name"},
                            {"name": "{result.total}", "description": "Result top group total"},
                            {"name": "{result.description}", "description": "Result top group description"},
                            {"name": "{result.groups}", "description": "Result groups"},
                            {"name": "{result.groups.total}", "description": "Result groups total"},

                            {"name": "{user.username}", "description": "Logged user name"},
                            {"name": "{user.firstname}", "description": "Logged user fistname"},
                            {"name": "{user.lastname}", "description": "Logged user lastname"},
                            {"name": "{user.email}", "description": "Logged user email"}
                        ]
                    }
            /*{JSON-END}*/
            ;
            return Constants;
        });
