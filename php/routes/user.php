<?php
$app->get('/user', function () use ($app) {
    $users = [];
    $allusers = R::getAll('SELECT * FROM '.USER_BEAN.' ORDER BY username');
    foreach ($allusers as $user) {
        $perms = Perm::perm4Item($user['id'], $app->const->USER_TYPE);
        if ($perms!=false) {
            $user['perms'] = $perms;
            $users[] = $user;
        }
    }
	$app->response()->header('Content-Type', 'application/json');
	echo json_encode($users);
});

$app->get('/user/:id', function ($id) use ($app) {

    $user = R::load(USER_BEAN, $id);

	$user->ownUserList;
	$user->ownGroupList;

	$user->quizzes = [];
    $user->groups = [];
    $user->permissions = [];

	foreach ($user->sharedPermissionList as $permission) {
	    $permission->description = Perm::assocObj($permission);
		switch($permission->type) {
			case $app->const->QUIZ_TYPE:
				if ($permission->name == 'assigned')
				    $user->quizzes[] = $permission;
				break;
            case $app->const->GROUP_TYPE:
                if ($permission->name == 'member')
                    $user->groups[] = $permission;
                break;
            case $app->const->OPERATION_TYPE:
                $user->permissions[] = $permission;
                break;
			default:
		}
	}
    unset($user->sharedPermissionList);

    $user->perms = Perm::perm4Item($id, $app->const->USER_TYPE);

    if ($user) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($user->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/user/:id/password', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $user = R::load(USER_BEAN, $id); $errors=[];
    if (empty($user)) $errors[] = 'User does not exists!';
    if ($user->password != md5($post->oldpass)) $errors[] = 'Old pass does not match!';
    if (empty($post->newpass1)) $errors[] = 'Password can not be empty!';
    if ($post->newpass1 != $post->newpass2) $errors[] = '2nd typed password not match!';
    if (empty($errors)) {
        $user->password = md5($post->newpass1);
        $user->modified = date('Y-m-d H:i:s');
        R::store($user);
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode('ok');
    } else {
        $app->response()->status(417);
        echo json_encode($errors);
    }
});

$app->post('/user', function () use ($app) {
	$post = json_decode($app->request()->getBody());

	$user = R::dispense(USER_BEAN);
	$user->username = strtolower($post->username);
    $user->firstname = $post->firstname;
    $user->lastname = $post->lastname;
	$user->email = $post->email;
	$user->password = md5($post->password);
	$user->is_admin = $post->is_admin;
	$user->maxusers = isset($post->maxusers)?$post->maxusers:0;
	$user->maxgroups = isset($post->maxgroups)?$post->maxgroups:0;
    $user->type = $post->type;
    $user->created = date('Y-m-d H:i:s');
    $user->modified = date('Y-m-d H:i:s');
    R::begin();
    try{
        R::store($user);
        $currentUser = R::load(USER_BEAN, $app->user->id);
        $currentUser->ownUserList[] = $user;
        R::store($currentUser);
        Perm::add4($user);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    }

    if ($user) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($user->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/user/:id', function ($id) use ($app) {
	$post = json_decode($app->request()->getBody());
	$user = R::findOne(USER_BEAN, 'id=?', array($id));
	$user->username = $post->username;
    $user->firstname = $post->firstname;
    $user->lastname = $post->lastname;
	$user->email = $post->email;
    //$user->password = md5($post->password);
	$user->is_admin = $post->is_admin;
	$user->maxusers = isset($post->maxusers)?$post->maxusers:0;
	$user->maxgroups = isset($post->maxgroups)?$post->maxgroups:0;
    $user->type = $post->type;
    $user->modified = date('Y-m-d H:i:s');
	R::store($user);

    if ($user) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($user->export());
    } else {
        $app->response()->status(404);
    }
});

$app->get('/user/:userid/permission/:permissionid', function($userid, $permissionid) use ($app) {
	$user = R::load(USER_BEAN, $userid);$bFound = false;
	foreach ($user->sharedPermissionList as $permission) {
		if ($permission->id == $permissionid) {
			unset($user->sharedPermissionList[$permission->id]);
			$bFound = true;
			break;
		}
	}
	if ($bFound == false) {
		$permission = R::load(PERMISSION_BEAN,$permissionid);
		$user->sharedPermissionList[] = $permission;
	}

	R::store($user);

    if ($user) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($bFound?'removed':'added');
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/user/:id', function ($id) use ($app) {
    $user = R::findOne(USER_BEAN, 'id=?', array($id));
    $perms = R::find(PERMISSION_BEAN,'type = ? AND data = ?',[$app->const->USER_TYPE,$id]);
    $answers = R::find(QUIZ_ANSWER_BEAN,'user_id = ?',[$id]);
    $results = R::find(QUIZ_RESULT_BEAN,'user_id = ?',[$id]);
    R::begin();
    try{
        R::trashAll($answers);
        R::trashAll($results);
        R::trash($user);
        R::trashAll($perms);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    }
});

/*user/js*/

$app->get('/user/js/:id', function ($id) use ($app) {
    $user = AppUser::js($id);
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($user);
});

$app->put('/user/js/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $user = R::findOne(USER_BEAN, 'id=?', array($id));
    $user->username = $post->username;
    $user->firstname = $post->firstname;
    $user->lastname = $post->lastname;
    $user->email = $post->email;
    $user->password = md5($post->password);
    $user->is_admin = $post->is_admin;
    $user->maxusers = isset($post->maxusers)?$post->maxusers:0;
    $user->maxgroups = isset($post->maxgroups)?$post->maxgroups:0;
    $user->type = $post->type;
    R::store($user);
});
