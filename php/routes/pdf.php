<?php
require_once '../php/components/QPdf.php';

$app->get('/pdf/test', function () use ($app) {
    $data = [
        'filename' => 'test.pdf',
        'subject' => 'subject body',
        'body' => 'body test'
    ];
    $data = (Object)$data;
    $pdf = new QPdf($data);
    $app->response()->header('Content-Type', 'application/pdf');
    $app->response()->header('Content-Disposition: attachment; filename="'.$data->filename.'";');
    $app->response()->header('Content-Length: '.filesize(RUNTIME_DIR.$data->filename));

    $pdf->generate('I');
});

$app->get('/pdf/quiz/:id/:lang', function ($id, $lang) use ($app) {
    
    $oQuiz = R::load(QUIZ_BEAN, $id);
    $oQuiz->loadAll();
    if ($oQuiz) {
        $data = [
            'type' => 'quiz',
            'more' => $oQuiz,
            'title' => qtr($oQuiz->name,$lang),
            'html' => $oQuiz->toHtml($lang)
        ];
        $data = (Object)$data;
        $pdf = new QPdf($data);
        $app->response()->header('Content-Type', 'application/pdf');
        $app->response()->header('Content-Disposition:');
        $pdf->generate('I');        
    }
});


$app->get('/pdf/result/:id/:lang', function ($id, $lang) use ($app) {
    
    $oResult = new QuizRes($id);
   
    if ($oResult) {
        $data = [
            'type' => 'result',
            'more' => $oResult,
            'title' => qtr($oResult->quiz['name'],$lang),
            'html' => $oResult->getHtmlResult($lang)
        ];
        $data = (Object)$data;
        $pdf = new QPdf($data);
        $app->response()->header('Content-Type', 'application/pdf');
        $app->response()->header('Content-Disposition: attachment;');
        $pdf->generate('I');        
    }
});
