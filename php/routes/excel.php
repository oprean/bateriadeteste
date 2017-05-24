<?php
require_once '../php/components/QExcel.php';
$app->get('/excel/test', function () use ($app) {
    $users = R::getAll('SELECT * FROM USER');
    $excel = new QExcel($users);  
    $excel->generate();
});

$app->get('/excel/result/:lang(/:user/:group/:quiz)', function ($lang, $user=null, $group=null, $quiz=null) use ($app) {
    
    $where = '1=1 ';  
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
            $data = json_decode($result['data']);
            $results[] = [
                'id' => $result['id'],
                'created' => $result['created'],
                'quiz' => qtr(json_decode($quiz['name']),$lang),
                'user' => $user->fullname(),
                'result' => qtr($data->result->name,$lang),
                'resval' => $data->result->total
            ]; 
        }
    }
    
    $excel = new QExcel($results);  
    $excel->generate();
});