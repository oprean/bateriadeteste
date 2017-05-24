<?php
require_once 'php/bootstrap.php';

session_cache_limiter(false);
session_start();

R::setup( 'sqlite:'.ROOT_DIR.'/data/bateriadeteste.sqlite' );

\Slim\Slim::registerAutoloader();

$oView = new DefaultView();
$oView->setLayout('default_layout.php');

$app = new \Slim\Slim(array(
	'debug' => DEBUG_MODE,
	'view' => $oView,
    'templates.path' => 'php/templates'
));
$app->add(new TokenAuth());

require_once(ROOT_DIR.'/php/routes/main.php');

$app->run();
R::close();
?>