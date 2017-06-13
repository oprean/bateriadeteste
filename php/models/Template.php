<?php
class Template extends RedBean_SimpleModel {
    public function renderTitle($data) {
        return $this->render('title', $data);
    }

    public function renderContent($data) {
        return $this->render('content', $data);
    }
    
    public function render($field, $data) {
        $app = \Slim\Slim::getInstance();
        $field = $app->lang.'_'.$field;
        $text = empty($this->$field)
            ?$this->{'int_'.$field}
            :$this->$field;

        foreach ($app->const->GENERAL_TEMPLATE_VARIABLE as $tplVar) {
            $text = str_replace($tplVar->name, self::getTplVarVal($tplVar->name, $app->lang, $data), $text);
        };
        return $text;
    }
    
    public static function qtr($textObj, $lang) {
        return empty($textObj->$lang) ? $textObj->int : $textObj->$lang;
    }
    
    public static function getTplVarVal($tplVar, $lang, $data) {

        switch ($tplVar) {
            case '{quiz.name}': 
                if (property_exists($data, 'quiz')) {
                    $quiz = R::load(QUIZ_BEAN, $data->quiz);
                }
                return self::qtr($quiz->name, $lang);
                
            case '{quiz.link}': 
                return BASE_URL.'/app#quiz/'.$data->quiz.'/q/home';
                
            case '{user.name}': 
                $user = R::load(USER_BEAN, $data->user);
                return $user->fullName();

            default: return $tplVar;
        }
    }
}