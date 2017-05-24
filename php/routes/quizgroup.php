<?php
$app->get('/quiz/group', function () use ($app) {
    $id = $app->request()->params('quizid');
    if ($id) {
        $items = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id = ?', [$id]);        
    } else {
        $items = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.']');
    }
    $groups = [];
    foreach ($items as $item) {
        $item['name'] = json_decode($item['name']);
        $item['description'] = json_decode($item['description']);
        $groups[] = $item;
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($groups);   
});

$app->get('/quiz/group/:id', function ($id) use ($app) {
  
    $item = R::load( QUIZ_GROUP_BEAN, $id );
    $item->name = json_decode($item->name);
    $item->description = json_decode($item->description);
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item);
    } else {
        $app->response()->status(404);
    }   
});

$app->post('/quiz/group', function () use ($app) {
    $post = json_decode($app->request()->getBody());
    
    $item = R::dispense(QUIZ_GROUP_BEAN);
    $item->name = json_encode(['int' => $post->int_name, 'ro' => $post->ro_name, 'en' => $post->en_name]);
    $item->description = json_encode(['int' => $post->int_description, 'ro' => $post->ro_description, 'en' => $post->en_description]);
    $item->quiz = R::load( QUIZ_BEAN, $post->quiz_id );
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

$app->put('/quiz/group/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $item = R::load( QUIZ_GROUP_BEAN, $id );
    $item->name = json_encode(['int' => $post->int_name, 'ro' => $post->ro_name, 'en' => $post->en_name]);
    $item->description = json_encode(['int' => $post->int_description, 'ro' => $post->ro_description, 'en' => $post->en_description]);
    $item->modified = date('Y-m-d H:i:s');
    R::store($item);
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/quiz/group/:id', function ($id) use ($app) {
    $item = R::load( QUIZ_GROUP_BEAN, $id );
    R::trash($item);  
    echo json_encode("quiz group deleted");
});