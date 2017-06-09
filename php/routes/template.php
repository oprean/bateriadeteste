<?php
$app->get('/template', function () use ($app) {
    $templates = R::getAll('SELECT * FROM '.TEMPLATE_BEAN.' ORDER BY name ASC');
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($templates);	
});

$app->get('/template/:id', function ($id) use ($app) {
    $template = R::findOne(TEMPLATE_BEAN, $id);
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($template);	
});

$app->post('/template', function () use ($app) {
    $post = json_decode($app->request()->getBody());

    $tmpl = R::dispense(TEMPLATE_BEAN);
    $tmpl->name = $post->name;
    $tmpl->description = $post->description;
    $tmpl->type = $post->type;
    $tmpl->int = null;
    $tmpl->ro = null;
    $tmpl->en = null;
    $tmpl->params = $post->params;
    $tmpl->created = date('Y-m-d H:i:s');
    $tmpl->modified = date('Y-m-d H:i:s');
    R::store($tmpl);
    	
    if ($tmpl) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($tmpl->export());
    } else {
        $app->response()->status(404);
    }
});

$app->put('/template/:id', function ($id) use ($app) {
    $post = json_decode($app->request()->getBody());

    $tmpl = R::findOne(TEMPLATE_BEAN, $id);
    $tmpl->int = $post->int;
    $tmpl->ro = $post->ro;
    $tmpl->en = $post->en;
    $tmpl->modified = date('Y-m-d H:i:s');
    R::store($tmpl);
    	
    if ($tmpl) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($tmpl->export());
    } else {
        $app->response()->status(404);
    }
});