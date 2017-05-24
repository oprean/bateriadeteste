<?php
$app->get('/quiz/question', function () use ($app) {
    $quizId = $app->request()->params('quizid');
    if ($quizId) {
        $quizType = R::getCell('SELECT type from ['.QUIZ_BEAN.'] WHERE id = ?',[$quizId] );
        $items = R::getAll('SELECT * FROM ['.QUIZ_QUESTION_BEAN.'] WHERE quiz_id = ? ORDER BY position', [$quizId]);        
    } else {
        $items = R::getAll('SELECT * FROM ['.QUIZ_QUESTION_BEAN.']');
    }
    $questions = [];
    foreach ($items as $item) {
        $item['text'] = json_decode($item['text']);
        if (!empty($item['quizgroup_id'])) {
            $groupName = R::getCell('SELECT name FROM ['.QUIZ_GROUP_BEAN.'] WHERE id = ?',[$item['quizgroup_id']]);
            $item['group'] = !empty($groupName)?json_decode($groupName):null;            
        }
        
        //options 
        // TODO move outside of loop when there are common options
        if ($quizType == $app->const->QUIZ_TYPE_GIFTS) {
            $optionsRaw = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                    [$app->const->QUIZ_OPTION_QUIZ_TYPE, $quizId]);
        } else {
            $optionsRaw = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                    [$app->const->QUIZ_OPTION_QUESTION_TYPE, $item['id']]);        
        }
                  
        if (!empty($optionsRaw)) {
            $options = [];
            foreach ($optionsRaw as $option) {
                $option['text'] = json_decode($option['text']);
                if (!empty($option['quizgroup_id'])) {
                    $groupName = R::getCell('SELECT name FROM ['.QUIZ_GROUP_BEAN.'] WHERE id = ?',[$option['quizgroup_id']]);
					$option['group'] = !empty($groupName)?json_decode($groupName):null;            
                }
                $options[] = $option;
            }
            $item['options'] = $options;
        }
            
        $questions[] = $item;
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($questions);   
});

$app->get('/quiz/:id/question/:no', function ($quizId, $questionNo) use ($app) {
    $quiz = R::getRow('SELECT * from ['.QUIZ_BEAN.'] WHERE id = ?',[$quizId] );
    $question = R::getRow('SELECT * from ['.QUIZ_QUESTION_BEAN.'] WHERE quiz_id=? AND position=?',[$quizId, $questionNo] );
    $question['text'] = json_decode($question['text']);
	$question['quiz_type'] = $quiz['type'];
    $question['quiz_name'] = json_decode($quiz['name']);
    
    //progress
    $total = R::getCell('SELECT count(1) from ['.QUIZ_QUESTION_BEAN.'] WHERE quiz_id=?',[$quizId]);
    $percent = round($questionNo*100/$total,2);
    $question['progress'] = ['current' => (int)$questionNo, 'total'=> (int)$total, 'percent' => (int)$percent, 'text' => $percent.'%'];
    
    //options
    if ($quiz['type'] == $app->const->QUIZ_TYPE_GIFTS) {
        $optionsRaw = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                [$app->const->QUIZ_OPTION_QUIZ_TYPE, $quizId]);
    } else {
        $optionsRaw = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                [$app->const->QUIZ_OPTION_QUESTION_TYPE, $question['id']]);        
    }
        
    if (!empty($optionsRaw)) {
        $options = [];
        foreach ($optionsRaw as $option) {
            $option['text'] = json_decode($option['text']);
            $option['quizgroup_id'] = empty($option['quizgroup_id'])?$question['quizgroup_id']:$option['quizgroup_id'];
            if (!empty($option['quizgroup_id'])) {
                $groupName = R::getCell('SELECT name FROM ['.QUIZ_GROUP_BEAN.'] WHERE id = ?',[$option['quizgroup_id']]);
                $option['group'] = !empty($groupName)?json_decode($groupName):null;            
            }
            $options[] = $option;
        }
        $question['options'] = $options;
    }
	
    //answer
    $answer = R::getRow('SELECT * FROM ['.QUIZ_ANSWER_BEAN.'] WHERE user_id = ? AND quiz_id = ? AND question_id = ? AND quizresult_id is null', 
            [$app->user->id, $quizId, $question['id']]);
            
	if (!empty($answer)){
        $answer['data'] = json_decode($answer['data']);
        $question['answer'] = $answer;  
	} else {
	    $question['answer'] = null;
	}
    
    if ($question) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($question);
    } else {
        $app->response()->status(404);
    }
});

$app->get('/quiz/question/:id', function ($id) use ($app) {
  
    $item = R::load( QUIZ_QUESTION_BEAN, $id );

    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item);
    } else {
        $app->response()->status(404);
    }   
});

$app->post('/quiz/question/sort', function () use ($app) {
    $post = $app->request()->post();
    if (isset($post['qids'])) {
        $pos = 1;
        foreach ($post['qids'] as $qid) {
            R::exec('UPDATE ['.QUIZ_QUESTION_BEAN.'] SET position = ? WHERE id = ?',[$pos,$qid]);
            $pos++;
        }
    }
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($post);
    
});

$app->post('/quiz/question', function () use ($app) {
    $post = json_decode($app->request()->getBody());
    
    $item = R::dispense(QUIZ_QUESTION_BEAN);
    $item->text = json_encode(['int' => $post->int_text, 'ro' => $post->ro_text, 'en' => $post->en_text]);
    $item->quiz = R::load( QUIZ_BEAN, $post->quiz_id );
    $item->quizgroup_id = isset($post->quizgroup_id)?$post->quizgroup_id:null;
    $pos = R::getCell('SELECT MAX(position) FROM ['.QUIZ_QUESTION_BEAN.'] WHERE quiz_id = ?',[$post->quiz_id]);
    $item->position = ++$pos; 
    $item->created = date('Y-m-d H:i:s');
    $item->modified = date('Y-m-d H:i:s');
    R::store($item);
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }    
});

$app->put('/quiz/question/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $item = R::load( QUIZ_QUESTION_BEAN, $id );
    $item->text = json_encode(['int' => $post->int_text, 'ro' => $post->ro_text, 'en' => $post->en_text]);
    $item->quizgroup_id = isset($post->quizgroup_id)?$post->quizgroup_id:null;
    $item->modified = date('Y-m-d H:i:s');
    R::store($item);
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/quiz/question/:id', function ($id) use ($app) {
    $item = R::load( QUIZ_QUESTION_BEAN, $id );
    $options = R::find(QUIZ_OPTION_BEAN,'parent_id = ?, parent_type = ?',[$item->id, $app->const->QUIZ_OPTION_QUESTION_TYPE]);
    R::trashAll($options);
    R::trash($item);  
    echo json_encode("quiz question deleted");
});