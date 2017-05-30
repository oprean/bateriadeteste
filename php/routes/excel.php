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
    
    $resultsRaw = R::getAll($sql);
    
    $results=[];
    
    foreach ($resultsRaw as $result) {
        $permQuiz = Perm::perm4Item($result['quiz_id'], $app->const->QUIZ_TYPE);
        $permUser = Perm::perm4Item($result['user_id'], $app->const->USER_TYPE);
        if (!empty($permQuiz) && !empty($permUser)) {
            $quiz = R::getRow('SELECT name,type FROM '.QUIZ_BEAN.' WHERE id=?',[$result['quiz_id']]);
            if($quiz['type'] == $app->const->QUIZ_TYPE_SURVEY)continue;
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

$app->get('/excel/survey/:id/:lang', function ($id, $lang) use ($app) {
      
    $resultsRaw = R::getAll('SELECT * FROM '.QUIZ_RESULT_BEAN.' WHERE quiz_id=?',[$id]);
    
    $results=[];
    
    foreach ($resultsRaw as $result) {
        $permQuiz = Perm::perm4Item($result['quiz_id'], $app->const->QUIZ_TYPE);
        $permUser = Perm::perm4Item($result['user_id'], $app->const->USER_TYPE);
        if (!empty($permQuiz) && !empty($permUser)) {
            $user = R::load(USER_BEAN, $result['user_id']);
            $data = json_decode($result['data']);
            $res = [
                'id' => $result['id'],
                'created' => $result['created'],
                'user' => $user->fullname(),
                'email' => $user->email,
            ];

            foreach ($data as $no => $question) {
                $key = 'Q'.($no+1).' - '.qtr($question->question, $lang);
                if (count($question->answer)==1) {
                    //type 2 = input,3 = textarea
                    $res[$key] = in_array($question->answer[0]->type, [2,3])
                            ?$question->answer[0]->value
                            :qtr($question->answer[0]->text, $lang);
                    $res['Q'.($no+1)] = !in_array($question->answer[0]->type, [2,3])
                            ?$question->answer[0]->value
                            :null;
                } else {
                    $txt = [];
                    foreach ($question->answer as $text) {
                        $txt[] =qtr($text->text, $lang);
                    }
                    $res[$key] = implode(',',$txt);
                }

            }
            $results[] = $res; 
        }
    }

    $excel = new QExcel($results);  
    $excel->generate();
});