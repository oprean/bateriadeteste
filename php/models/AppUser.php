<?php
class AppUser {
    public $id;
    public $isAdmin;
	private $_bean;
	
	function __construct($id = null) {
        $this->id = $id;
		$this->_bean = R::load(USER_BEAN, $id);
        $this->isAdmin = $this->_bean->is_admin?true:false;
	}

	public static function login($username, $password) {
		$user = self::validateUser($username, $password); 
		if (!empty($user)) {
			$return['uid'] = $user->id;
			$return['name'] = $user->username;
			$return['token'] = bin2hex(openssl_random_pseudo_bytes(16));
			$tokenExpiration = date('Y-m-d H:i:s', strtotime('+1 hour'));
			self::updateToken($user->username, $return['token'], $tokenExpiration);
			
			return $return;
		}
		return false;
	}
	
	static function js($id = null) {
		$app = \Slim\Slim::getInstance();
		$id = empty($id)?$_SESSION['bdt.user']['uid']:$id;
		$user = R::getRow('SELECT id, username, firstname, lastname, email, token, is_admin, maxusers, maxgroups, user_id, type FROM '.USER_BEAN.' WHERE id =?', [$id]);
        
		$sqlPerm = 'SELECT P.id, P.name, P.type, P.data FROM permission P , permission_user PU WHERE P.id = PU.permission_id AND ';
		$permissions = R::getAll($sqlPerm.'PU.user_id = ?',[$id]);

		foreach ($permissions as $permission) {
			switch ($permission['type']) {
				case $app->const->OPERATION_TYPE:
					$user['permissions'][] = $permission['name'];	
					break;
                case $app->const->GROUP_TYPE:
                    $user['groups'][] = (int)$permission['data'];  
                    break;			
				case $app->const->QUIZ_TYPE:
					$user['quizzes'][] = (int)$permission['data'];	
					break;
				default:
					break;
			}
		}
        
        $ownUsers = R::getCol('SELECT id from '.USER_BEAN.' where user_id = ?',[$id]);
        $ownGroups = R::getCol('SELECT id from ['.GROUP_BEAN.'] where user_id = ?',[$id]);
        $user['ownUser'] = $ownUsers;
        $user['ownGroup'] = $ownGroups;
        $user['userQuota'] = $user['maxusers'] - count($ownUsers);
        $user['groupQuota'] = $user['maxgroups'] - count($ownGroups);
        $user['isAdmin'] = empty($user['is_admin'])?false:true;
		return (object)$user;
	}
	
	static function updateToken($username, $token, $tokenExpiration) {
		$user = R::findOne(USER_BEAN , ' username = ? ', array($username));
		if (!empty($user)) {
			$user->token = $token;
			$user->token_expire = $tokenExpiration;
			R::store($user);
			return true;			
		} else {
			return false;
		} 
	}
	
	static function tokenRemove($token) {
		$user = R::findOne(USER_BEAN , ' token = ? ', array($token));
		if (!empty($user)) {
			$user->token = null;
			R::store($user);
		}
	}
	
	static function keepTokenAlive($token) {
		$user = R::findOne(USER_BEAN , ' token = ? ', array($token));
		if (!empty($user)) {
			$user->token_expire = date('Y-m-d H:i:s', strtotime('+1 hour'));
			R::store($user);
		}
	}
	
	static function validateToken($token) {
		$user = R::findOne(USER_BEAN , ' token = ? ', array($token));
		return !empty($user);
	}
	
	static function validateUser($username, $password) {
		$user = R::findOne(USER_BEAN , ' username = ? OR email = ? ', array($username, $username));
		return (!empty($user) && md5($password) == $user->password)?$user:false;
	}

    static function hasPerm($name, $userid=null, $type=null, $data=null) {
        $app = \Slim\Slim::getInstance();
        if ($userid===null && $app->user->isAdmin) return true;
         
        $userid = $userid===null?$app->user->id:$userid;
        $type = $type===null?0:$type;
        $data = $data===null?0:$data;
               
        $has = R::getCell('SELECT count(1) FROM permission p, permission_user pu WHERE p.id = pu.permission_id AND user_id = ? AND p.name = ? AND type = ? AND ifnull(data,0) = ? ',
            [$userid, $name, $type, $data]);
            
        return !empty($has);
    }
}