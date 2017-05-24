<?php
$app->get('/quiz', function () use ($app) {
    $quizzes = [];
    $includes = $app->request()->params('include');
    $onlyAssigned = $app->request()->params('assigned');
    $includes = explode('|',$includes);//print_r($includes);die;
    if ($app->user->isAdmin) {
        $allquizzes = R::getAll('SELECT * FROM '.QUIZ_BEAN.' ORDER BY name');        
    } else {
        $allquizzes = R::getAll('SELECT * FROM '.QUIZ_BEAN.' WHERE active=? ORDER BY name',[1]);
    }
        
    foreach ($allquizzes as $quiz) {
        $quiz['perms'] = Perm::perm4Item($quiz['id'], $app->const->QUIZ_TYPE); 
        if ($quiz['perms']!=false) {
            if ($onlyAssigned && !in_array('assigned', $quiz['perms'])) continue;
            $quiz['name'] = json_decode($quiz['name']);
            $quiz['description'] = json_decode($quiz['description']);
            $quiz['template'] = json_decode($quiz['template']);

            
            if(!empty($includes)) {
                foreach ($includes as $include) {
                    switch ($include) {
                        case 'status':
                            $progress=0;$questionNo=0;$resultsNo=0;
                            $inProgress = R::getCell('SELECT count(1) FROM ['.QUIZ_ANSWER_BEAN.'] WHERE quiz_id=? and user_id=? and quizresult_id is null',[$quiz['id'], $app->user->id]);
                            if ($inProgress) {
                                $questionNo = R::getCell('SELECT MIN(position) FROM quizquestion WHERE quiz_id=? AND id NOT IN (SELECT question_id FROM quizanswer WHERE quiz_id=? AND user_id=? AND quizresult_id IS null)',
                                    [$quiz['id'], $quiz['id'], $app->user->id]);
                                $questionNo = $questionNo?$questionNo:1;    
                            }
                            $resultsNo = R::getCell('SELECT count(1) from ['.QUIZ_RESULT_BEAN.'] WHERE quiz_id = ? AND user_id=? ORDER by created DESC',[$quiz['id'], $app->user->id]);
                            $status = (!empty($inProgress))?'in-progress':'done';
                            $quiz['status'] = [
                                'text' => $status,
                                'question' => (int)$questionNo,
                                'results' => (int)$resultsNo
                            ];                            
                            break;
                        case 'groups':
                            $groupsRaw = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$quiz['id']]);
                            foreach ($groupsRaw as $group) {
                                $group['id'] = (int)$group['id'];
                                $group['name'] = json_decode($group['name']);
                                $group['description'] = json_decode($group['description']);
                                $groups[] = $group;
                            };
                            $quiz['groups'] = $groups;
                            break;
                        default:                       
                            break;
                    }
                }
            }
             
            $quizzes[] = $quiz;
        } 
    }
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($quizzes); 
});

$app->get('/quiz/:id', function ($quizId) use ($app) {
    $userId = $app->request()->params('user_id');
    $quiz = R::getRow('SELECT * FROM ['.QUIZ_BEAN.'] WHERE id = ?', [$quizId]);
    $includes = $app->request()->params('include');
    $includes = explode('|',$includes);
    
    if (!empty($quiz)) {
        $quiz['quiz'] = $quiz;
        $quiz['name'] = json_decode($quiz['name']);
        $quiz['description'] = json_decode($quiz['description']);
        $quiz['template'] = empty($quiz['template'])
            ?['int' => null, 'ro' => null, 'en' => null]
            :json_decode($quiz['template']);
        $sql = 'SELECT u.* FROM user AS u, permission as p, permission_user as pu WHERE u.id = pu.user_id AND pu.permission_id = p.id AND ';
        $members = R::getAll($sql.'p.name=? AND p.type = ? AND p.data = ?',['assigned', $app->const->QUIZ_TYPE, $quizId]);
        $quiz['members'] = [];
        foreach ($members as $user) {
            $perm = Perm::perm4Item($user['id'], $app->const->USER_TYPE);
            if ($perm!=false) {
                $quiz['members'][] = $user;
            }
        }
        
        if (!empty($userId)) {
            $results=[];$progress=null;
            $inProgress = R::getCell('SELECT count(1) FROM ['.QUIZ_ANSWER_BEAN.'] WHERE quiz_id=? and user_id=? and quizresult_id is null',[$quizId, $userId]);
            $status = (!empty($inProgress))?'in-progress':'done';
            $results = R::getRow('SELECT * from ['.QUIZ_RESULT_BEAN.'] WHERE quiz_id = ? AND user_id=? ORDER by created DESC',[$quizId, $userId]);
            $quiz['status'] = [
                'text' => $status,
                'results' => $results
            ];
        }
        
        if(!empty($includes)) {
            foreach ($includes as $include) {
                switch ($include) {
                    case 'groups':
                        $groupsRaw = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$quiz['id']]);
                        foreach ($groupsRaw as $group) {
                            $group['id'] = (int)$group['id'];
                            $group['name'] = json_decode($group['name']);
                            $group['description'] = json_decode($group['description']);
                            $groups[] = $group;
                        };
                        $quiz['groups'] = $groups;
                        break;
                    case 'translations_stats':
                        $status = new QuizTranslation($quiz);
                        $quiz['translations'] = $status->stats();
                        break;
                    case 'translations':
                        $translations = new QuizTranslation($quiz, true);
                        $quiz['translations'] = $translations;
                        $quiz['translations_stats'] = $translations->stats();
                        break;
                    default:                       
                        break;
                }
            }
        }
        
        $perms = Perm::perm4Item($quiz['id'], $app->const->QUIZ_TYPE); 
        if ($perms!=false) {
            $quiz['perms'] = $perms;
        }    
    }
    if ($quiz) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($quiz);
    } else {
        $app->response()->status(404);
    }   
})->conditions(['id' => '[\d]+']);

$app->post('/quiz', function () use ($app) {
	$post = json_decode($app->request()->getBody());

	$item = R::dispense(QUIZ_BEAN);
    $item->name = ['int' => $post->int_name, 'ro' => $post->ro_name, 'en' => $post->en_name];
    $item->description = ['int' => $post->int_description, 'ro' => $post->ro_description, 'en' => $post->en_description];
	$item->type = $post->type;
	$item->active = $post->active;
	$item->created = date('Y-m-d H:i:s');

    R::begin();
    try{
        R::store($item);
        $currentUser = R::load(USER_BEAN, $app->user->id);
        $currentUser->ownQuizList[] = $item;
        R::store($currentUser);
        Perm::add4($item);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    }  
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/quiz/:id', function ($id) use ($app) {
	$post = json_decode($app->request()->getBody());
	
	$item = R::findOne(QUIZ_BEAN, 'id=?', array($id));
    if (isset($post->int_name))	{
        $item->name = ['int' => $post->int_name, 'ro' => $post->ro_name, 'en' => $post->en_name];        
    }
    if (isset($post->int_description)) {
        $item->description = ['int' => $post->int_description, 'ro' => $post->ro_description, 'en' => $post->en_description];        
    }
    if (isset($post->int_template)) {
        $item->template = ['int' => $post->int_template, 'ro' => $post->ro_template, 'en' => $post->en_template];        
    }
	$item->type = $post->type;
	$item->active = $post->active;
	$item->modified = date('Y-m-d H:i:s');
		
	R::store($item);
	
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/quiz/:id', function ($id) use ($app) {
   
    $item = R::findOne(QUIZ_BEAN, 'id=?', array($id));
    $perms = R::find(PERMISSION_BEAN,'type = ? AND data = ?',[$app->const->QUIZ_TYPE,$id]);
    $groups = R::find(QUIZ_GROUP_BEAN,'group_id = ?',[$id]);
    $options = R::find(QUIZ_OPTION_BEAN,'parent_id = ?, parent_type = ?',[$id, $app->const->QUIZ_OPTION_QUIZ_TYPE]);
    $questions = R::find(QUIZ_QUESTION_BEAN,'group_id = ?',[$id]);
    
    R::begin();
    try{
        R::trashAll($perms);
        R::trashAll($groups);
        R::trashAll($options);
        foreach ($questions as $question) {
            $options = R::find(QUIZ_OPTION_BEAN,'parent_id = ?, parent_type = ?',[$question->id, $app->const->QUIZ_OPTION_QUESTION_TYPE]);
            R::trashAll($options);
        }        
        R::trashAll($questions);
        R::trash($item);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    } 
    
    echo json_encode("quiz deleted");
});

$app->get('/quiz/:id/assigned', function ($id) use ($app) {
    $quiz = R::findOne(QUIZ_BEAN, 'id=?', array($id));
    $permId = R::getCell('SELECT id from '.PERMISSION_BEAN.' WHERE name=? AND data=? AND type=?', 
        ['assigned', $id, $app->const->QUIZ_TYPE]);
    $uids = R::getCol('SELECT user_id from permission_user WHERE permission_id=?', [$permId]);
    $allIds = User::allIDs();

    if (empty($uids)) {
        $assigned = [];
        $unassigned = R::getAll('SELECT * FROM '.USER_BEAN.' WHERE id IN ('.implode(',', $allIds).')');
    } else {
        $assigned = R::getAll('SELECT * FROM '.USER_BEAN.' WHERE id IN ('.implode(',', $uids).')');
        $unassigned = R::getAll('SELECT * FROM '.USER_BEAN.' WHERE id IN ('.implode(',', $allIds).') AND id NOT IN ('.implode(',', $uids).')');      
    }       

    if ($quiz) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode([
            'unassigned' => $unassigned,
            'assigned' => $assigned,
        ]);
    } else {
        $app->response()->status(404);
    }   
});

$app->post('/quiz/:id/assigned', function ($id) use ($app) {
    $post = $app->request()->post();
    if (!empty($post['uids'])) {
        $permId = R::getCell('SELECT id from '.PERMISSION_BEAN.' WHERE name=? AND data=? AND type=?', 
           ['assigned', $id, $app->const->QUIZ_TYPE]);
     
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