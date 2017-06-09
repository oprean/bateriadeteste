<?php
$app->get('/template', function () use ($app) {
    $templates = R::getAll('SELECT * FROM '.TEMPLATE_BEAN.' ORDER BY name ASC');
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($templates);	
});

$app->get('/template/:id', function ($id) use ($app) {
    $template = R::load(TEMPLATE_BEAN, $id);
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($template->export());
});

$app->post('/template', function () use ($app) {
    $post = json_decode($app->request()->getBody());

    $tmpl = R::dispense(TEMPLATE_BEAN);
    $tmpl->name = $post->name;
    $tmpl->system = sanitize($post->name);
    $tmpl->title = $post->title;
    $tmpl->description = $post->description;
    $tmpl->type = $post->type;
    $tmpl->params = $post->params;
    $tmpl->int = null;
    $tmpl->ro = null;
    $tmpl->en = null;
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

    $tmpl = R::load(TEMPLATE_BEAN, $id);
    $tmpl->name = $post->name;
    $tmpl->system = sanitize($post->name);
    $tmpl->title = $post->title;
    $tmpl->description = $post->description;
    $tmpl->type = $post->type;
    $tmpl->params = $post->params;
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

$app->delete('/template/:id', function ($id) use ($app) {

    $tmpl = R::load(TEMPLATE_BEAN, $id);
    R::trash($tmpl);
    	
    if ($tmpl) {
        $app->response()->header('Content-Type', 'application/json');
        echo json_encode($tmpl->export());
    } else {
        $app->response()->status(404);
    }
});