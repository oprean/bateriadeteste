<?php
class QuizRes {
    
    var $quiz;
    var $groups;
    var $id;
    var $data;
    var $app;
    var $userId;
    var $user;
    
    function __construct($id=null, $quizId=null, $userId=null) {
        
        $this->id = $id;
        $this->app = \Slim\Slim::getInstance();     
        $this->userId = empty($userId)?$this->app->user->id:$userId;
        $this->user = R::getRow('SELECT * FROM ['.USER_BEAN.'] WHERE id=?',[$this->userId]);
			
        if (empty($this->id) && !empty($quizId)) {
        	
	        $groups = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$quizId]);
	        foreach ($groups as $group) {
	            $group['id'] = (int)$group['id'];
	            $group['name'] = json_decode($group['name']);
	            $group['description'] = json_decode($group['description']);
	            $this->groups[] = $group;
	        }
			
            $this->quiz = R::getRow('SELECT * from ['.QUIZ_BEAN.'] WHERE id = ?',[$quizId] );
            $newAnswers = R::getAll('SELECT count(1) FROM ['.QUIZ_ANSWER_BEAN.'] WHERE quiz_id=? and user_id=? and quizresult_id is null',[$this->quiz['id'], $this->userId]);
            if ($newAnswers) {
                $this->buildResult();
            } else {
                throw new Exception("No new answers!", 1);
            }
        } elseif (!empty($this->id) && empty($quizId)) {
            $result = R::getRow('SELECT * from ['.QUIZ_RESULT_BEAN.'] WHERE id = ?',[$this->id]);
            $quizId = $result['quiz_id'];
            $this->userId = $result['user_id'];
            $this->quiz = R::getRow('SELECT * from ['.QUIZ_BEAN.'] WHERE id = ?',[$quizId] );
            $this->user = R::getRow('SELECT * FROM ['.USER_BEAN.'] WHERE id=?',[$this->userId]);
        }

        $this->quiz['name'] = json_decode($this->quiz['name']);
        $this->quiz['description'] = json_decode($this->quiz['description']);        
        $this->quiz['template'] = json_decode($this->quiz['template']);        
    }

    function getResult() {
        $res = null;
        if (empty($this->id)) {
            $res = R::getRow('SELECT * from ['.QUIZ_RESULT_BEAN.'] WHERE quiz_id = ? AND user_id=? ORDER by created DESC',[$this->quiz['id'], $this->userId]);
        } else {
            $res = R::getRow('SELECT * from ['.QUIZ_RESULT_BEAN.'] WHERE id = ?',[$this->id]);
        }
        if (!empty($res)) {
            $res['data'] = json_decode($res['data']);
        }

        return $res;
    }
    
    function getTplVarVal($tplVar, $lang) {
        
          switch($tplVar){
               case '{quiz.name}': return self::qtr($this->quiz['name'],$lang);
               case '{quiz.description}': return self::qtr($this->quiz['description'],$lang);
			                 
               case '{result.name}': return self::qtr($this->data['data']->result->name,$lang);
               case '{result.description}': return self::qtr($this->data['data']->result->description,$lang);
               case '{result.total}': return $this->data['data']->result->total;
               case '{result.groups.total}': return $this->data['data']->total;
               case '{result.groups}': return $this->getHtmlResultGroups($lang); 
               
               case '{user.username}': return $this->user['username'];
               case '{user.firstname}': return $this->user['firstname'];
               case '{user.lastname}': return $this->user['lastname'];
               case '{user.email}': return $this->user['email'];
               
               default: return $tplVar;
           }
    }
    
	function getHtmlResultGroups($lang) {
		$out = '<ul>';
		foreach ($this->data['data']->groups as $group) {
			$out .= '<li class="score-item" data-group-id="'.$group->group_id.'">';
			$out .= '<span class="score-name">'.self::qtr($group->name,$lang).'</span>';
			$out .= ' <span class="badge">'.$group->total.'</span><br>';
			$out .= '<span style="display: none" class="score-description">'.self::qtr($group->description,$lang).'</span></li>';
		}
		$out .='</ul>';
		
		return $out;
	}
	
	private static function qtr($textObj, $lang) {
		return empty($textObj->$lang)?$textObj->int:$textObj->$lang;
	}
	
    function getHtmlResult($lang) {
        $html = self::qtr($this->quiz['template'],$lang);
        $this->data = $this->getResult();
        foreach ($this->app->const->TEMPLATE_VARIABLE as $tplVar) {
            $html = str_replace($tplVar->name, $this->getTplVarVal($tplVar->name, $lang), $html);
        }

        return $html;        
    }

    function saveResult() {
        R::begin();
        try{
            $resultBean = R::dispense(QUIZ_RESULT_BEAN);
            $resultBean->data = json_encode($this->result);
            $resultBean->created = date('Y-m-d H:i:s');
            $resultBean->user_id = $this->userId;
            $resultBean->quiz_id = $this->quiz['id'];
            R::store($resultBean);
            R::exec('UPDATE ['.QUIZ_ANSWER_BEAN.'] SET quizresult_id=? WHERE quiz_id=? and user_id=?',[$resultBean->id, $this->quiz['id'], $this->userId]);
            R::commit();
        }
        catch( Exception $e ) {
            print_r($e);
            R::rollback();
        }
    }
    
    function buildResult() {
        $newAnswers = R::getAll('SELECT * FROM ['.QUIZ_ANSWER_BEAN.'] WHERE quiz_id=? and user_id=? and quizresult_id is null',[$this->quiz['id'], $this->userId]);
        if (empty($newAnswers)) return 'no new answers';
    
        $answers=[];        
        foreach ($newAnswers as $answer) {
            $answer['data'] = json_decode($answer['data']);
            $answers[] = $answer;
        }
    
        switch ($this->quiz['type']) {
            case $this->app->const->QUIZ_TYPE_SURVEY:
                $this->buildSurveyResult($answers);
                break;
            case $this->app->const->QUIZ_TYPE_GIFTS:
                $this->buildGiftsResult($answers);
                break;
            case $this->app->const->QUIZ_TYPE_LOVE:
                $this->buildLoveResult($answers);
                break;
            case $this->app->const->QUIZ_TYPE_BELBIN:
                $this->buildBelbinResult($answers);
                break;
            default:            
                break;
        }
        
        return true;
    }
    
    private static function sort_callback($r1, $r2) {
        if ($r1['total'] == $r2['total']) return 0;
        return ($r1['total'] < $r2['total'])? 1 : -1;
    }

	function getGroup($id) {
		foreach ($this->groups as $group) {
			if ($group['id']==$id) return $group;
		}
	}

    function buildGiftsResult($answers) {

        $groups = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$this->quiz['id']]);
        $result = [];$grandTotal=0;
        foreach ($groups as $group) {
            $total = 0;
            foreach ($answers as $answer) {
                if ($answer['data'][0]->group_id == $group['id']) $total += $answer['data'][0]->option_val;                  
            }
            $result[] = [
                'group_id' => (int)$group['id'],
                'name' => json_decode($group['name']),
                'description' => json_decode($group['description']),
                'total' => $total
            ];
            $grandTotal +=$total;
        }
        usort($result,'QuizRes::sort_callback');
        
        $this->result = [
            'groups' => $result,
            'result' => $result[0],
            'total' => $grandTotal
        ]; 
        
        $this->saveResult();
    }
    
    function buildLoveResult($answers) {
        $groups = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$this->quiz['id']]);
        $result = [];
        foreach ($groups as $group) {
            $total = 0;
            foreach ($answers as $answer) {
                if ($answer['data'][0]->group_id == $group['id']) $total++;                  
            }
            $result[] = [
                'group_id' => (int)$group['id'],
                'name' => json_decode($group['name']),
                'description' => json_decode($group['description']),
                'total' => $total
            ];
        }
        usort($result,'QuizRes::sort_callback');
        
        $this->result = [
            'groups' => $result,
            'result' => $result[0],
            'total' => 0
        ]; 
        
        $this->saveResult();
    }
    
    function buildBelbinResult($answers) {
        $totals = [];$result = [];
        $groups = R::getAll('SELECT * FROM ['.QUIZ_GROUP_BEAN.'] WHERE quiz_id=?',[$this->quiz['id']]);
        foreach ($groups as $group) { $totals[$group['id']]=0; }
        foreach ($answers as $answer) {
            foreach ($answer['data'] as $data) {
               $totals[$data->group_id] += $data->option_val; 
            }                 
        }
        foreach ($totals as $group_id => $total) {
        	$group = $this->getGroup($group_id);
            $result[] = [
                'group_id' => (int)$group_id,
				'name' => $group['name'],
                'description' => $group['description'],
                'total' => $total
            ];
        }

        usort($result,'QuizRes::sort_callback');
        
        $this->result = [
            'groups' => $result,
            'result' => $result[0],
            'total' => 0
        ]; 
        
        $this->saveResult();
    }
    
    function buildSurveyResult($answers) {
        $this->result = $answers;
        $this->saveResult();
    }
}
