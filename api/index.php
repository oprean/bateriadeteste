<?php
require_once '../php/bootstrap.php';

session_cache_limiter(false);
session_start();

R::setup( 'sqlite:'.ROOT_DIR.DS.'data'.DS.'bateriadeteste.sqlite' );
\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app->config('debug', DEBUG_MODE);
$app->const = jsconstants();

// not sure this is ok!
if (isset($_SESSION['bdt.user'])) {
	$app->user = new AppUser($_SESSION['bdt.user']['uid']);
}

$app->add(new TokenAuth());

//require_once(ROOT_DIR.'/php/routes/results.php');
//require_once(ROOT_DIR.'/php/routes/mail.php');
//require_once(ROOT_DIR.'/php/routes/pdf.php');
//require_once(ROOT_DIR.'/php/routes/info.php');

//require_once(ROOT_DIR.'/php/routes/admin.php');
require_once(ROOT_DIR.'/php/routes/group.php');
require_once(ROOT_DIR.'/php/routes/user.php');
require_once(ROOT_DIR.'/php/routes/permission.php');
require_once(ROOT_DIR.'/php/routes/quiz.php');
require_once(ROOT_DIR.'/php/routes/quizgroup.php');
require_once(ROOT_DIR.'/php/routes/quizoption.php');
require_once(ROOT_DIR.'/php/routes/quizquestion.php');
require_once(ROOT_DIR.'/php/routes/quizanswer.php');
require_once(ROOT_DIR.'/php/routes/quizresult.php');
require_once(ROOT_DIR.'/php/routes/mail.php');
require_once(ROOT_DIR.'/php/routes/translation.php');
require_once(ROOT_DIR.'/php/routes/pdf.php');
require_once(ROOT_DIR.'/php/routes/excel.php');
require_once(ROOT_DIR.'/php/routes/template.php');

$app->run();
R::close();