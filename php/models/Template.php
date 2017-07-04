<?php
class Template extends RedBean_SimpleModel {
    public function renderTitle($data = null) {
        return $this->render('title', $data);
    }

    public function renderContent($data = null) {
        return $this->render('content', $data);
    }
    
    public function render($field, $data = null) {
        $app = \Slim\Slim::getInstance();
        $text = empty($this->{$app->lang.'_'.$field})
            ?$this->{'int_'.$field}
            :$this->{$app->lang.'_'.$field};

        if ($this->type != 'text') {
            foreach ($app->const->GENERAL_TEMPLATE_VARIABLE as $tplVar) {
                $text = str_replace($tplVar->name, self::getTplVarVal($tplVar->name, $app->lang, $data), $text);
            };
        }    
  
        return $text;
    }
    
    public static function qtr($textObj, $lang) {
        return empty($textObj->$lang) ? $textObj->int : $textObj->$lang;
    }
    
    public static function getTplVarVal($tplVar, $lang, $data=null) {

        switch ($tplVar) {
            case '{quiz.name}': 
                if (!empty($data) && property_exists($data, 'quiz')) {
                    $quiz = R::load(QUIZ_BEAN, $data->quiz);
                    return self::qtr($quiz->name, $lang);
                }               
            case '{quiz.link}': 
                if (!empty($data) && property_exists($data, 'quiz')) {
                    return BASE_URL.'/app#quiz/'.$data->quiz.'/q/home';
                }
                
            case '{user.name}': 
                if (!empty($data) && property_exists($data, 'user')) {
                    $user = R::load(USER_BEAN, $data->user);
                    return $user->fullName();
                }
            case '{base.link}': 
                return BASE_URL;
                
            case '{app.name}': 
                $tmpl = R::findOne(TEMPLATE_BEAN, 'system = ?', ['app-name']);
                return $tmpl->renderTitle();
                
            case '{app.motto}': 
                $tmpl = R::findOne(TEMPLATE_BEAN, 'system = ?', ['app-name']);
                return $tmpl->renderContent();
                
            case '{rand}': 
                $r = rand(0, 1);
                return $r?$r:'';

            default: return $tplVar;
        }
    }
}