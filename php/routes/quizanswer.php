<?php
$app->get('/quiz/answer', function () use ($app) {
    $id = $app->request()->params('questionid');
    if ($id) {
        $items = R::getAll('SELECT * FROM ['.QUIZ_ANSWER_BEAN.'] WHERE question_id = ?', [$id]);        
    } else {
        $items = R::getAll('SELECT * FROM ['.QUIZ_ANSWER_BEAN.']');
    }
  
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($items);   
});

$app->get('/quiz/answer/:id', function ($id) use ($app) {
  
    $item = R::load( QUIZ_ANSWER_BEAN, $id );
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item);
    } else {
        $app->response()->status(404);
    }   
});
/*
as a valid answer for a question we store data in json format:
data: {
    [{option_id:oid, option_value: oval}]
}*/
$app->post('/quiz/answer', function () use ($app) {
    $post = json_decode($app->request()->getBody());
    
    $item = R::dispense(QUIZ_ANSWER_BEAN);
    $item->user_id = $app->user->id;
    $item->quizresult_id = null;
    $item->quiz_id = $post->quiz_id;
    $item->question_id = $post->question_id;
    $item->created = date('Y-m-d H:i:s');
    $item->modified = date('Y-m-d H:i:s');
    $item->data = json_encode($post->data);
    R::store($item);
    
    if ($item) {
        $item->data = json_decode($item->data);
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }    
});

$app->put('/quiz/answer/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $item = R::load( QUIZ_ANSWER_BEAN, $id );
    $item->data = json_encode($post->data);
    $item->modified = date('Y-m-d H:i:s');
    R::store($item);
    
    if ($item) {
        $item->data = json_decode($item->data);
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }    
});