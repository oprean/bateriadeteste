<?php
$app->get('/quiz/result', function () use ($app) {
    
    $where = '1=1 '; 
    $quiz = $app->request()->params('quiz');
    $group = $app->request()->params('group');
    $user = $app->request()->params('user'); 
    $where .= is_numeric($quiz)?' AND quiz_id='.$quiz:'';
    
    if ((is_numeric($user) && is_numeric($group))||
        (!is_numeric($user) && is_numeric($group))) {
        $sql = 'SELECT u.id FROM user AS u, permission as p, permission_user as pu WHERE u.id = pu.user_id AND pu.permission_id = p.id AND ';
        $groupMembers = R::getCol($sql.'p.name=? AND p.type = ? AND p.data = ?',['member', $app->const->GROUP_TYPE, $group]);
        $where .= ' AND user_id IN ('.implode(',',$groupMembers).')';
    } else if (is_numeric($user)) {
        $where .= ' AND user_id='.$user;
    }
    
    $sql = 'SELECT * FROM '.QUIZ_RESULT_BEAN.' WHERE '.$where;
    //print_r($sql);die;
    
    $resultsRaw = R::getAll($sql);
    
    $results=[];
    
    foreach ($resultsRaw as $result) {
        $permQuiz = Perm::perm4Item($result['quiz_id'], $app->const->QUIZ_TYPE);
        $permUser = Perm::perm4Item($result['user_id'], $app->const->USER_TYPE);
        if (!empty($permQuiz) && !empty($permUser)) {
            $quiz = R::getRow('SELECT name FROM '.QUIZ_BEAN.' WHERE id=?',[$result['quiz_id']]);
            $user = R::load(USER_BEAN, $result['user_id']);
            $results[] = [
                'id' => $result['id'],
                'created' => $result['created'],
                'quiz' => json_decode($quiz['name']),
                'user' => $user->fullname(),
            ]; 
        }
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($results);
});

$app->get('/quiz/:id/result', function ($quizId) use ($app) {
    $oResult = new QuizRes(null, $quizId);
    if ($oResult) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode([
            'quiz' => $oResult->quiz,
            'user' => $oResult->user,
            'groups' => $oResult->groups,
            'result' => $oResult->getResult()
        ]);
    } else {
        $app->response()->status(404);
    }   
});

$app->get('/quiz/result/:id', function ($id) use ($app) {
    $oResult = new QuizRes($id);
    if ($oResult) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode([
            'quiz' => $oResult->quiz,
            'user' => $oResult->user,
            'groups' => $oResult->groups,
            'result' => $oResult->getResult()
        ]);
    } else {
        $app->response()->status(404);
    }   
});

$app->delete('/quiz/result/:id', function ($id) use ($app) {
   
    $result = R::findOne(QUIZ_RESULT_BEAN, 'id=?', array($id));
    $answers = R::find(QUIZ_ANSWER_BEAN,'quizresult_id = ?',[$id]);
    
    R::begin();
    try{
        R::trashAll($answers);
        R::trash($result);
        R::commit();
    }
    catch( Exception $e ) {
        R::rollback();
    } 
	
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode("result deleted");
});

$app->get('/quiz/results/filter', function () use ($app) {
    $users = R::getAll('SELECT id,username, firstname, lastname FROM '.USER_BEAN.' ORDER BY username');        
    foreach ($users as $i => $user) {
        $perms = Perm::perm4Item($user['id'], $app->const->USER_TYPE); 
        if ($perms!==false) {
            if (empty($user['firstname']) && empty($user['lastname'])) {
                $user['name'] = $user['username'];
            } else {
                $user['name'] = $user['username'].' ('.$user['firstname'].' '.$user['lastname'].')';
            }
            $users[$i] = $user;
        } else {
            unset($users[$i]);            
        }
    }

    $quizzes = R::getAll('SELECT id, name FROM '.QUIZ_BEAN.' ORDER BY name');        
    foreach ($quizzes as $i => $quiz) {
        $perms = Perm::perm4Item($quiz['id'], $app->const->QUIZ_TYPE); 
        if ($perms!==false) {
            $quizzes[$i]['name'] = json_decode($quizzes[$i]['name']);
        } else {
            unset($quizzes[$i]);
        }
    }
    
    $groups = R::getAll('SELECT id, name FROM ['.GROUP_BEAN.'] ORDER BY name');   
    foreach ($groups as $i => $group) {
        $perms = Perm::perm4Item($group['id'], $app->const->GROUP_TYPE); 
        if ($perms===false) unset($groups[$i]);
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode([
        'users' => $users,
        'quizzes' => $quizzes,
        'groups' => $groups,
    ]);  
});
