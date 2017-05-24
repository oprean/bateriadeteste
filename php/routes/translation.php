<?php
$app->get('/translation', function () use ($app) {
    $quizzes=[];
    $quizzesRaw = R::getAll('SELECT id,name,description, type, template FROM '.QUIZ_BEAN);
    foreach ($quizzesRaw as $quiz) {
        $quiz['name'] = json_decode($quiz['name'])->int;
        $status = new QuizTranslation($quiz);
        $quiz['translations'] = $status->stats();
        unset($quiz['description']);unset($quiz['template']);
        $quizzes[] = $quiz;
    }
   
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($quizzes);
});

$app->get('/translation/:quizid', function ($quizId) use ($app) {
    $quiz = R::getRow('SELECT id,name,description, type, template FROM '.QUIZ_BEAN.' WHERE id=?',[$quizId]);
    $trans = new QuizTranslation($quiz,true);
    $quiz['translations'] = $trans;
   
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode($quiz);
});

$app->get('/translation/copy/:quizid/:from/to/:to', function ($quizId, $fromLang, $toLang) use ($app) {
  
    $quiz = R::findOne(QUIZ_BEAN, 'id=?', array($quizId));
    $quiz->name = QuizTranslation::copyLang($quiz->name, $fromLang, $toLang); 
    $quiz->description = QuizTranslation::copyLang($quiz->description, $fromLang, $toLang); 
    $quiz->template = QuizTranslation::copyLang($quiz->template, $fromLang, $toLang);
    $quiz->modified = date('Y-m-d H:i:s');
    R::store($quiz);

    $groups = R::find(QUIZ_GROUP_BEAN,'quiz_id=?', [$quiz->id]);
    foreach ($groups as $group) {
        $group->name = QuizTranslation::copyLang($group->name, $fromLang, $toLang); 
        $group->description = QuizTranslation::copyLang($group->description, $fromLang, $toLang);
        $group->modified = date('Y-m-d H:i:s');
        R::store($group);
    }
    if ($quiz->type == $app->const->QUIZ_TYPE_GIFTS) {
        $options = R::find(QUIZ_OPTION_BEAN,'parent_type = ? AND parent_id = ?', [$app->const->QUIZ_OPTION_QUIZ_TYPE, $quiz->id]); 
        foreach ($options as $option) {
            $option->text = QuizTranslation::copyLang($option->text, $fromLang, $toLang);
            $option->modified = date('Y-m-d H:i:s');
            R::store($option);
        }
    }
    $questions = R::find(QUIZ_QUESTION_BEAN,'quiz_id=?', [$quiz->id]);
    foreach ($questions as $question) {
        $question->text = QuizTranslation::copyLang($question->text, $fromLang, $toLang);
        $question->modified = date('Y-m-d H:i:s');
        R::store($question);
        if ($quiz->type != $app->const->QUIZ_TYPE_GIFTS) {
            $options = R::find(QUIZ_OPTION_BEAN,'parent_type = ? AND parent_id = ?', [$app->const->QUIZ_OPTION_QUESTION_TYPE, $question->id]); 
            foreach ($options as $option) {
                $option->text = QuizTranslation::copyLang($option->text, $fromLang, $toLang);
                $option->modified = date('Y-m-d H:i:s');
                R::store($option);
            } 
        }
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode('ok');
});

$app->get('/translation/delete/:quizid/from/:lang', function ($quizId, $lang) use ($app) {
    
    $quiz = R::findOne(QUIZ_BEAN, 'id=?', array($quizId));
    $quiz->name = QuizTranslation::deleteLang($quiz->name, $lang); 
    $quiz->description = QuizTranslation::deleteLang($quiz->description, $lang); 
    $quiz->template = QuizTranslation::deleteLang($quiz->template, $lang);
    $quiz->modified = date('Y-m-d H:i:s');
    R::store($quiz);
    
    $groups = R::find(QUIZ_GROUP_BEAN,'quiz_id=?', [$quiz->id]);
    foreach ($groups as $group) {
        $group->name = QuizTranslation::deleteLang($group->name, $lang); 
        $group->description = QuizTranslation::deleteLang($group->description, $lang);
        $group->modified = date('Y-m-d H:i:s');
        R::store($group);
    }
    if ($quiz->type == $app->const->QUIZ_TYPE_GIFTS) {
        $options = R::find(QUIZ_OPTION_BEAN,'parent_type = ? AND parent_id = ?', [$app->const->QUIZ_OPTION_QUIZ_TYPE, $quiz->id]); 
        foreach ($options as $option) {
            $option->text = QuizTranslation::deleteLang($option->text, $lang);
            $option->modified = date('Y-m-d H:i:s');
            R::store($option);
        }
    }
    $questions = R::find(QUIZ_QUESTION_BEAN,'quiz_id=?', [$quiz->id]);
    foreach ($questions as $question) {
        $question->text = QuizTranslation::deleteLang($question->text, $lang);
        $question->modified = date('Y-m-d H:i:s');
        R::store($question);
        if ($quiz->type != $app->const->QUIZ_TYPE_GIFTS) {
            $options = R::find(QUIZ_OPTION_BEAN,'parent_type = ? AND parent_id = ?', [$app->const->QUIZ_OPTION_QUESTION_TYPE, $question->id]); 
            foreach ($options as $option) {
                $option->text = QuizTranslation::deleteLang($option->text, $lang);
                $option->modified = date('Y-m-d H:i:s');
                R::store($option);
            } 
        }
    }
    
    $app->response()->header('Content-Type', 'application/json');
    echo json_encode('ok');
});

class QuizTranslation {
    public $intCnt=0, $enCnt=0, $roCnt=0, $total=0;
    public $intList=[], $enList=[], $roList=[];
    public $incList;
    function __construct($quiz,$incList = false) {
        $app = \Slim\Slim::getInstance();
        $this->incList = $incList;
        
        $this->checkItem($quiz, 'name', QUIZ_BEAN);
        $this->checkItem($quiz, 'description', QUIZ_BEAN);
        $this->checkItem($quiz, 'template', QUIZ_BEAN);
        $groups = R::getAll('SELECT * FROM '.QUIZ_GROUP_BEAN.' WHERE quiz_id=?', [$quiz['id']]);

        foreach ($groups as $group) {
            $this->checkItem($group, 'name', QUIZ_GROUP_BEAN);
            $this->checkItem($group, 'description', QUIZ_GROUP_BEAN);
        }
        if ($quiz['type'] == $app->const->QUIZ_TYPE_GIFTS) {
            $options = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                [$app->const->QUIZ_OPTION_QUIZ_TYPE, $quiz['id']]);
            foreach ($options as $option) {
                $this->checkItem($option, 'text', QUIZ_OPTION_BEAN);
            }
        }
        $questions = R::getAll('SELECT * FROM '.QUIZ_QUESTION_BEAN.' WHERE quiz_id=?', [$quiz['id']]);
        foreach ($questions as $question) {
            $this->checkItem($question, 'text', QUIZ_QUESTION_BEAN);
            if ($quiz['type'] != $app->const->QUIZ_TYPE_GIFTS) {
                $options = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                    [$app->const->QUIZ_OPTION_QUESTION_TYPE, $question['id']]);
                foreach ($options as $option) {
                    $this->checkItem($option, 'text', QUIZ_OPTION_BEAN);
                } 
            }
        }
    }

    static function itemObj($json) {

        if (is_string($json)) {

            $item = json_decode($json);    
        } else if (is_array($json)) {
            $item = (Object)$json;
        } else if (is_object($json)) {
            $item = $json;
        } else if ($json === null || $json=='') {
            $item = json_decode(json_encode(['int'=>'', 'ro'=>'', 'en'=>'']));
        };
        
        return $item;
    }

    static function copyLang($item, $from, $to) {
        $item = self::itemObj($item);
        $item->$to = $item->$from;        
        
        return json_encode($item);
    }
    
    static function deleteLang($item, $lang) {
        if ($lang == 'int') {
            throw new Exception("You are not allowed to delete internal language!", 1);
        }

        $item = self::itemObj($item);
        $item->$lang = '';
                        
        return json_encode($item);
    }  

    function checkItem($row, $field, $table) {
        $item = self::itemObj($row[$field]);

        if($this->incList) {
            $this->intList[] = [
                'row_id' => $row['id'],
                'text' => isset($item->int)?$item->int:'',
                'field' => $field,
                'table' => $table
            ];
            $this->roList[] = [
                'row_id' => $row['id'],
                'text' => isset($item->ro)?$item->ro:'',
                'field' => $field,
                'table' => $table
            ];
            $this->enList[] = [
                'row_id' => $row['id'],
                'text' => isset($item->en)?$item->en:'',
                'field' => $field,
                'table' => $table
            ];
        }             
        if (!empty($item->int)) $this->intCnt++;
        if (!empty($item->en)) $this->enCnt++;
        if (!empty($item->ro)) $this->roCnt++;
        $this->total++;
    }
    
    function stats() {
        return [
            'total' => $this->total,
            'int' => number_format($this->intCnt*100/$this->total,1),
            'ro' => number_format($this->roCnt*100/$this->total,1),
            'en' => number_format($this->enCnt*100/$this->total,1),
        ];
    }
}