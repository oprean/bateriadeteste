<?php
$app->get('/permission', function () use ($app) {
	$permissionsRaw = R::getAll('SELECT * FROM '.PERMISSION_BEAN.' ORDER BY type ASC, data ASC');
    $includes = $app->request()->params('include');
    $distinct = $app->request()->params('destinct');
    $includes = explode('|',$includes);
    if (empty($includes)) {
        $permissions[] = $permissionsRaw;        
    } else {
        foreach ($permissionsRaw as $permission) {
            foreach ($includes as $include) {
                switch ($include) {
                    case 'assocobj': $permission['assocobj'] = Perm::assocObj($permission);break;
                }        
           }
           $permissions[] = $permission;
        }
    }
   
    if (!empty($distinct)) {
        $dataIds=[];$perms=[];
        foreach ($permissions as $perm) {
            if (empty($perm['data'])) {        
                $perms[] = $perm;
            } else {
                if (!in_array($perm['data'].'_'.$perm['type'], $dataIds)) {
                    array_push($dataIds,$perm['data'].'_'.$perm['type']);
                    $perms[] = $perm;    
                }
            }
        }
        $permissions = $perms;
    }
    
	$app->response()->header('Content-Type', 'application/json');
	echo json_encode($permissions);	
});

$app->get('/permission/type/:type/:data', function ($type, $data) use ($app) {
    $assocobj = Perm::assocObj(['type' => $type, 'data' => $data]);
    $perms = R::getAll('SELECT * FROM permission WHERE type=? and data=? ORDER BY type ASC, data ASC',[$type,$data]);
    $data = [
        'assocobj' => $assocobj,
        'perms' => $perms
    ];
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($data);
});

$app->get('/permission/type/:type/:data/fix', function ($type, $data) use ($app) {
    $defaults = Perm::getDefaultPermissions($type);
    $cnt = 0;
    foreach ($defaults as $perm) {
        $found = R::getCell('SELECT count(1) FROM '.PERMISSION_BEAN.' WHERE name=? AND type=? AND data=?',[$perm,$type,$data]);
        if (empty($found)) {
            $missingPerm = R::dispense(PERMISSION_BEAN);
            $missingPerm->name = $perm;
            $missingPerm->type = $type;
            $missingPerm->data = $data;
            $missingPerm->description = null;
            R::store($missingPerm);
            $cnt++;
        }
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($cnt.' permissions added!');
});

$app->get('/permission/user/:user', function ($userId) use ($app) {
    $assigned = []; $unassigned = [];
    $user = R::getRow('SELECT * FROM '.USER_BEAN.' WHERE id=?',[$userId]);
    $all = R::getAll('SELECT * FROM permission ORDER BY type ASC, data ASC');
    $assignedIds = R::getCol('SELECT id FROM permission WHERE id in (SELECT permission_id FROM permission_user WHERE user_id=?) ORDER BY type ASC, data ASC',[$userId]);
    foreach ($all as $perm) {
        $perm['assocobj'] = Perm::assocObj($perm);
        if (in_array($perm['id'], $assignedIds)) {
            if ($perm['type'] == $app->const->OPERATION_TYPE) {
                $assigned[Perm::typeName($perm['type'])][] = $perm;                
            } else {
                $assigned[Perm::typeName($perm['type'])][$perm['assocobj']][] = $perm;
            }
        } else {
            $unassigned[Perm::typeName($perm['type'])][] = $perm;
        }
    }
    $perms = [
        'user' => $user,
        'assigned' => $assigned,
        'unassigned' => $unassigned
    ];

    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($perms);
});

$app->get('/permission/assignments', function () use ($app) {
    $users = R::getAll('SELECT * FROM '.USER_BEAN.' ORDER BY username ASC');
    $assignments = [];
    foreach ($users as $user) {
        $permsRaw = R::getAll('SELECT id, name, type, data FROM permission WHERE id in (SELECT permission_id FROM permission_user WHERE user_id=?) ORDER BY type ASC, data ASC',[$user['id']]);
        $perms = [];
        foreach ($permsRaw as $perm) {
            $perm['assocobj'] = Perm::assocObj($perm);
            $perm['type_name'] = Perm::typeName($perm['type']);
            if ($perm['type'] == $app->const->OPERATION_TYPE) {
                $perms[$perm['type_name']][] = $perm;                
            } else {
                $perms[$perm['type_name']][$perm['assocobj']][] = $perm;
            }

        }
        $assignments[] = [
            'userid' => $user['id'],
            'username' => $user['username'], 
            'user' => $user,
            'perms' => $perms,
        ];
    }

    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($assignments); 
});

$app->get('/permission/type/:type/user/:userid', function ($type, $userid) use ($app) {
    $permissions = [];$all = []; $assigned = []; $unassigned = [];
    switch ($type) {
        case $app->const->OPERATION_TYPE:
            $all = R::getAll('SELECT * FROM '.PERMISSION_BEAN.' WHERE type = ?',[$type]);
            break;
        case $app->const->QUIZ_TYPE:
            $all = R::getAll('SELECT * FROM '.PERMISSION_BEAN.' WHERE type = ? AND name = ?',[$type, 'assigned']);
            break;
        case $app->const->GROUP_TYPE:
            $all = R::getAll('SELECT * FROM '.PERMISSION_BEAN.' WHERE type = ? AND name = ?',[$type, 'member']);
            break;
    }
    
    if (!$app->user->isAdmin) {
        foreach ($all as $i => $perm) {
            if ($type==$app->const->QUIZ_TYPE) {
                $permName = 'assign';
            } else if($type==$app->const->GROUP_TYPE) {
                $permName = 'edit';
            } else {
              $permName = $perm['name'];  
            };
            if (!AppUser::hasPerm($permName, $app->user->id, $type, $perm['data'])) unset($all[$i]);
        }
    }

    foreach ($all as $perm) {
        $perm['description'] = Perm::assocObj($perm);
        if (AppUser::hasPerm($perm['name'], $userid, $type, $perm['data'])) {
            $assigned[] = $perm;
        } else {
            $unassigned[] = $perm;    
        }        
    }    

    $permissions = [
        'all' => $all,
        'assigned' => $assigned,
        'unassigned' => $unassigned
    ];

	$app->response()->header('Content-Type', 'application/json');
	
    echo json_encode($permissions);
});

$app->post('/permission', function () use ($app) {
	$post = json_decode($app->request()->getBody());

	$permission = R::dispense(PERMISSION_BEAN);
	$permission->name = $post->name;
	$permission->type = $post->type;
	$permission->description = $post->description;
    $permission->created = date('Y-m-d H:i:s');
    $permission->modified = date('Y-m-d H:i:s');
	R::store($permission);
    if ($permission) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($permission->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/permission/:id', function ($id) use ($app) {
	$post = json_decode($app->request()->getBody());
	
	$permission = R::findOne(PERMISSION_BEAN, 'id=?', array($id));	
	$permission->name = $post->name;
	$permission->type = $post->type;
	$permission->description = $post->description;
    $permission->modified = date('Y-m-d H:i:s');
	R::store($permission);
	
    if ($permission) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($permission->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/permission/:id', function ($id) use ($app) {
	$permission = R::findOne(PERMISSION_BEAN, 'id=?', array($id));
	R::trash($permission);
});