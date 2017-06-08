<?php

$app->get('/', 'actionHome');
$app->get('/page/:name', 'actionPage');
$app->get('/lang/:lang', 'actionLanguage');
$app->get('/app', 'actionApp');
$app->get('/activate/:userid/:token', 'actionActivate');
$app->map('/login', 'actionLogin')->via('GET', 'POST');
$app->get('/logout', 'actionLogout');

function actionHome() {
    $app = \Slim\Slim::getInstance();
	$app->redirect('app');
}

function actionLanguage($lang) {
    $app = \Slim\Slim::getInstance();
	//dump($lang);die;
	$_SESSION['bdt.language'] = $lang;
	$app->redirect($app->request->getRootUri().'/app');
}

function actionPage($name) {
    $app = \Slim\Slim::getInstance();
    $app->view->setLayout('empty_layout.php');
    $app->render('page.php', array('jsapp' => false, 'error' => true, 'html' => $name));
}

function actionLogin() {
    $app = \Slim\Slim::getInstance();
	$app->view->setLayout('empty_layout.php');
    $post = $app->request->post();
	if (!empty($post)) {
		$user = AppUser::login($app->request->post('username'), $app->request->post('password')); 
		if ($user !==false) {
			$_SESSION['bdt.user'] = $user;
			$app->user = $user;
			$app->redirect('app');
		} else {
			$app->render('login.php', array('jsapp' => false, 'error' => true));			
		}	
	} else {
		$app->render('login.php', array('jsapp' => false));		
	}
}

function actionActivate($userid, $token) {
    $app = \Slim\Slim::getInstance();
	$app->view->setLayout('empty_layout.php');
	$user = R::load(USER_BEAN, $userid);
	if (empty($user)) {
		$msg = 'This user does not exist!';
	} else {
		if ($user->active == 0) {
			if ($user->token == $token) {
				$user->active = 1;
				R::store($user);
				$msg = 'Your account has been activated';
			} else {
				$msg = 'Invalid activation url';
			}	
		} else {
			$msg = 'Your account is already activated.';
		}		
	}
	
	$app->render('activated.php', array('jsapp' => false, 'msg' => $msg));
}

function actionLogout() {
	$app = \Slim\Slim::getInstance();
	session_destroy();
	$app->redirect('.');
}

function actionApp() {
    $app = \Slim\Slim::getInstance();
	$app->view->setLayout('jsapp_layout.php');
	$app->render('loader.php', array('jsapp' => true));
}