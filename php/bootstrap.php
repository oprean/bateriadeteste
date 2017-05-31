<?php
define('DS', DIRECTORY_SEPARATOR);
define('ROOT_DIR', dirname(dirname(__FILE__)));
define('RUNTIME_DIR', ROOT_DIR.DS.'runtime'.DS);
define('TEMPLATES_DIR', ROOT_DIR.DS.'php'.DS.'templates'.DS);

define('USER_BEAN', 'user');
define('PERMISSION_BEAN', 'permission');
define('PERMISSION_USER_BEAN', 'permission');
define('GROUP_BEAN', 'group');
define('QUIZ_BEAN', 'quiz');
define('QUIZ_INVITATION_BEAN', 'quizinvitation');
define('QUIZ_GROUP_BEAN', 'quizgroup');
define('QUIZ_OPTION_BEAN', 'quizoption');
define('QUIZ_QUESTION_BEAN', 'quizquestion');
define('QUIZ_ANSWER_BEAN', 'quizanswer');
define('QUIZ_RESULT_BEAN', 'quizresult');
define( 'REDBEAN_MODEL_PREFIX', '' );

require ROOT_DIR.'/vendor/autoload.php';
require_once(ROOT_DIR.'/php/config.php');
require_once(ROOT_DIR.'/php/components/globals.php');

require_once(ROOT_DIR.'/php/components/redbean/rb.php');
require_once(ROOT_DIR.'/php/components/TokenAuth.php');
require_once(ROOT_DIR.'/php/components/DefaultView.php');
require_once(ROOT_DIR.'/php/components/CVarDumper.php');

require_once(ROOT_DIR.'/php/models/AppUser.php');
require_once(ROOT_DIR.'/php/models/Perm.php');
require_once(ROOT_DIR.'/php/models/QuizResult.php');
require_once(ROOT_DIR.'/php/models/User.php');
require_once(ROOT_DIR.'/php/models/Group.php');
require_once(ROOT_DIR.'/php/models/Quiz.php');