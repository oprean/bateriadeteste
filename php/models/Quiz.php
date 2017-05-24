<?php
class Quiz extends RedBean_SimpleModel {
    public function open() {
       $this->name = json_decode($this->name);
       $this->description = json_decode($this->description);
       $this->template = json_decode($this->template);
    }
    
    public function update() {
       $this->name = !is_string($this->name)?json_encode($this->name):$this->name;
       $this->description = !is_string($this->description)?json_encode($this->description):$this->description;
       $this->template = !is_string($this->template)?json_encode($this->template):$this->template;
    }
    
    public function loadAll() {
        $app = \Slim\Slim::getInstance();
        $questions = R::getAll('SELECT * FROM '.QUIZ_QUESTION_BEAN.' WHERE quiz_id=?',[$this->id]);
        foreach ($questions as $i => $item) {
            $item['text'] = json_decode($item['text']);
            if (!empty($item['quizgroup_id'])) {
                $groupName = R::getCell('SELECT name FROM ['.QUIZ_GROUP_BEAN.'] WHERE id = ?',[$item['quizgroup_id']]);
                $item['group'] = !empty($groupName)?json_decode($groupName):null;            
            }
            
            //options 
            // TODO move outside of loop when there are common options
            if ($this->type == $app->const->QUIZ_TYPE_GIFTS) {
                $optionsRaw = R::getAll('SELECT * FROM ['.QUIZ_OPTION_BEAN.'] WHERE parent_type = ? AND parent_id = ? ORDER BY position', 
                        [$app->const->QUIZ_OPTION_QUIZ_TYPE, $this->id]);
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
                
            $questions[$i] = $item;
        }
        $this->questions = $questions;
        $this->groups = R::getAll('SELECT * FROM '.QUIZ_GROUP_BEAN.' WHERE quiz_id=?',[$this->id]);
    }
    
    function toHTML($lang) {
        $html='';
        $html .= '<h1>'.qtr($this->name, $lang).'</h1>';
        $html .= '<div>'.qtr($this->description, $lang).'</div>';
        $html .='<ul>';

        $html .= '<h2>Groups</h2>';
        $html .='<dl>';
        foreach ($this->groups as $group) {
            $html .='<dt>'.qtr(json_decode($group['name']),$lang).'</dt>';
            $html .='<dd>'.qtr(json_decode($group['description']),$lang).'</dd>';
        }
        $html .='</dl>';
        
        $html .= '<h2>Questions</h2>';
        foreach ($this->questions as $question) {
            $html .='<li>'.qtr($question['text'],$lang);
            $html .='<ul>';
            foreach ($question['options'] as $option) {
                $html .='<li>'.qtr($option['text'],$lang).'</li>';
            }
            $html .='</ul>';
        }
        $html .='</ul>';
        return $html;
    }

}
