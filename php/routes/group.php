<?php
$app->get('/group', function () use ($app) {
    $allgroups = R::getAll('SELECT * FROM ['.GROUP_BEAN.'] ORDER BY name');
    $groups=[];
    foreach ($allgroups as $group) {
        $group['perms'] = Perm::perm4Item($group['id'], $app->const->GROUP_TYPE);
        if ($group['perms']) $groups[] = $group;
    }
    $app->response()->header('Content-Type', 'application/json');        
	echo json_encode($groups);	
});

$app->get('/group/:id', function ($id) use ($app) {
    	
    $group = R::getRow('SELECT * FROM ['.GROUP_BEAN.'] WHERE id = ?', [$id]);
    if (!empty($group)) {
        $group['group'] = $group;
        $sql = 'SELECT u.* FROM user AS u, permission as p, permission_user as pu WHERE u.id = pu.user_id AND pu.permission_id = p.id AND ';
        $members = R::getAll($sql.'p.name=? AND p.type = ? AND p.data = ?',['member', $app->const->GROUP_TYPE, $id]);
        $group['members'] = [];
        foreach ($members as $user) {
            $perm = Perm::perm4Item($user['id'], $app->const->USER_TYPE);
            if ($perm!=false) {
                $group['members'][] = $user;
            }
        }

        $perms = Perm::perm4Item($id, $app->const->GROUP_TYPE); 
        $group['perms'] = $perms;
    }
    
    if ($group) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($group);
    } else {
        $app->response()->status(404);
    }	
});

$app->post('/group', function () use ($app) {
	$post = json_decode($app->request()->getBody());

	$group = R::dispense(GROUP_BEAN);
	$group->name = $post->name;
	$group->description = $post->description;
    $group->created = date('Y-m-d H:i:s');
    $group->modified = date('Y-m-d H:i:s');

    R::begin();
    try{
        R::store($group);   
        $curentUser = R::load(USER_BEAN, $app->user->id);
        $curentUser->ownGroupList[] = $group;
        R::store($curentUser);
        Perm::add4($group);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    }	
	
    if ($group) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($group->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/group/:id', function ($id) use ($app) {
	$post = json_decode($app->request()->getBody());
	
	$group = R::findOne(GROUP_BEAN, 'id=?', array($id));	
	$group->name = $post->name;
	$group->description = $post->description;
    $group->modified = date('Y-m-d H:i:s');
	R::store($group);
	
    if ($group) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($group->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/group/:id', function ($id) use ($app) {
	$group = R::findOne(GROUP_BEAN, 'id=?', array($id));   
    $perms = R::find(PERMISSION_BEAN,'type = ? AND data = ?',[$app->const->GROUP_TYPE,$id]);    
    R::begin();
    try{
        R::trash($group);
        R::trashAll($perms);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    }  
    
    echo json_encode("group deleted");
});

$app->get('/group/:id/members', function ($id) use ($app) {
    $group = R::findOne(GROUP_BEAN, 'id=?', array($id));
    $users=[];$assigned=[];$unassigned=[];
    $permId = R::getCell('SELECT id from '.PERMISSION_BEAN.' WHERE name=? AND data=? AND type=?', 
        ['member', $id, $app->const->GROUP_TYPE]);
        
    $allUsers = R::getAll('SELECT * FROM '.USER_BEAN.' ORDER BY username');

    foreach ($allUsers as $user) {
        $perms = Perm::perm4Item($user['id'], $app->const->USER_TYPE); 
        if ($perms!=false) $users[] = $user;
    } 
	$assignedUserIds = R::getCol('SELECT user_id from permission_user WHERE permission_id=?', [$permId]);
    
    foreach ($users as $user) {
        if (in_array($user['id'], $assignedUserIds)) {
            $assigned[] = $user;        
        } else {
            $unassigned[] = $user;
        }
    }
   	
    if ($group) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode([
            'unassigned' => $unassigned,
        	'assigned' => $assigned,
		]);
    } else {
        $app->response()->status(404);
    }	
});

$app->post('/group/:id/members', function ($id) use ($app) {
	$post = $app->request()->post();
	if (!empty($post['uids'])) {
	    $permId = R::getCell('SELECT id from '.PERMISSION_BEAN.' WHERE name=? AND data=? AND type=?', 
	       ['member', $id, $app->const->GROUP_TYPE]);
     
		if ($post['action'] == 'assign') {
			foreach ($post['uids'] as $uid) {
		      R::exec('INSERT INTO permission_user (permission_id, user_id) VALUES (?,?)',[$permId,$uid]);   	    
			}		
		} else {
			foreach ($post['uids'] as $uid) {
			  R::exec('DELETE FROM permission_user WHERE permission_id=? AND user_id=?',[$permId,$uid]);
			}
		}	
	}
});