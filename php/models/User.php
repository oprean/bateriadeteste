<?php
class User extends RedBean_SimpleModel {
	function fullName() {
	    if (!empty($this->bean->firstname) || !empty($this->bean->lastname)) {
           return $this->bean->firstname.' '.$this->bean->lastname;
       } else {
           return $this->bean->username;
       }
	}
    
    static function allIDs() {
        $app = \Slim\Slim::getInstance();
        if ($app->user->isAdmin) {
            $allIds = R::getCol('SELECT id FROM user');
        } else {
            $allIds = R::getCol('SELECT id FROM user WHERE id IN (SELECT p.data FROM permission p, permission_user pu WHERE p.id = pu.permission_id AND user_id = ? AND type = ?) OR user_id=?',
                [$app->user->id, $app->const->USER_TYPE, $app->user->id]);
            $allIds[] = $app->user->id; 
        }
            
        return $allIds;
    }
    
    static function emailById($id) {
        return R::getCell('SELECT email FROM '.USER_BEAN.' WHERE id=?',[$id]);
    }
}
