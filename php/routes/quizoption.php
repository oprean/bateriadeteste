<?php
$app->get('/quiz/option', function () use ($app) {
    $parent_type = $app->request()->params('parent_type');
    $parent_id = $app->request()->params('parent_id');
    if (isset($parent_type) && isset($parent_id)) {
        $items = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_id = ? AND parent_type = ? ORDER BY position', [$parent_id, $parent_type]);        
    } else {
        $items = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.']');
    }
    $options = [];
    foreach ($items as $item) {
        $item['text'] = json_decode($item['text']);
        $options[] = $item;
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($options);   
});

$app->get('/quiz/option/:id', function ($id) use ($app) {

    $item = R::load( QUIZ_OPTION_BEAN, $id );
    $item['text'] = json_decode($item['text']);
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }   
});

$app->post('/quiz/option', function () use ($app) {
    $post = json_decode($app->request()->getBody());
    
    $item = R::dispense(QUIZ_OPTION_BEAN);
    $item->text = json_encode(['int' => $post->int_text, 'ro' => $post->ro_text, 'en' => $post->en_text]);
    $item->parent_type = $post->parent_type;
	$item->type = $post->type;
    $item->value = $post->value;
    $item->parent_id = $post->parent_id;
    $pos = R::getCell('SELECT MAX(position) FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_id = ? AND parent_type = ?',[$post->parent_id, $post->parent_type]);
    $item->position = ++$pos;
    $item->quizgroup_id = empty($post->quizgroup_id)?null:$post->quizgroup_id;
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

$app->post('/quiz/option/sort', function () use ($app) {
    $post = $app->request()->post();
    if (isset($post['oids'])) {
        $pos = 1;
        foreach ($post['oids'] as $oid) {
            R::exec('UPDATE ['.QUIZ_OPTION_BEAN.'] SET position = ? WHERE id = ?',[$pos,$oid]);
            $pos++;
        }
    }
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($post);
    
});

$app->put('/quiz/option/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());
    $item = R::load( QUIZ_OPTION_BEAN, $id );
    $item->text = json_encode(['int' => $post->int_text, 'ro' => $post->ro_text, 'en' => $post->en_text]);
	$item->type = $post->type;
    $item->value = $post->value;
    $item->quizgroup_id = empty($post->quizgroup_id)?null:$post->quizgroup_id;
    $item->modified = date('Y-m-d H:i:s');
    R::store($item);
    
    if ($item) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($item->export());
    } else {
        $app->response()->status(404);
    }
});

$app->delete('/quiz/option/:id', function ($id) use ($app) {
    $item = R::load( QUIZ_OPTION_BEAN, $id );
    R::trash($item);  
    echo json_encode("quiz option deleted");
});