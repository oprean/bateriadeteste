<?php
class Perm {
    static function beanName($type) {
        $app = \Slim\Slim::getInstance();
        switch ($type) {
            case $app->const->QUIZ_TYPE:return QUIZ_BEAN;
            case $app->const->USER_TYPE:return USER_BEAN;
            case $app->const->GROUP_TYPE:return GROUP_BEAN;
            case $app->const->OPERATION_TYPE:return PERMISSION_BEAN;
        }
    }
    static function perm4Item($id, $type) {
        $app = \Slim\Slim::getInstance();
        $perms = R::getCol('SELECT p.name FROM permission p, permission_user pu WHERE p.id = pu.permission_id AND user_id = ? AND type = ? AND data = ? ',
            [$app->user->id, $type, $id]);
        if ($app->user->isAdmin) {
            array_push($perms,'admin');
        } else if($app->user->id==$id && $type==$app->const->USER_TYPE) {
            array_push($perms,'view','edit');
        } else {
            $ownerid = R::getCell('SELECT user_id FROM ['.Perm::beanName($type).'] WHERE id = ?',[$id]);                   
            if ($ownerid == $app->user->id) {
                array_push($perms,'view','edit','delete');
                switch ($type) {
                    case $app->const->QUIZ_TYPE:array_push($perms,'assign','translate');break;
                    case $app->const->USER_TYPE:array_push($perms,'quota');break;
                    case $app->const->GROUP_TYPE:array_push($perms,'member');break;
                    case $app->const->OPERATION_TYPE:break;
                }
            }
        }
        return empty($perms)?false:$perms;
    }

    static function add4($item) {
        $app = \Slim\Slim::getInstance();
        $type =  $item->getMeta('type');
        $perms = ['view','edit','delete'];
        switch ($type) {
            case QUIZ_BEAN:
                array_push($perms,'assigned','translate');
                foreach ($perms as $pname) {
                    $perm = R::dispense(PERMISSION_BEAN);
                    $perm->type = $app->const->QUIZ_TYPE;
                    $perm->name = $pname;
                    $perm->description = ucfirst($pname).' '.$type.' "'.$item->name.'"';
                    $perm->data = $item->id;
                    R::store($perm);
                }
                break;
            case USER_BEAN:
                array_push($perms,'quota');
                foreach ($perms as $pname) {
                    $perm = R::dispense(PERMISSION_BEAN);
                    $perm->type = $app->const->USER_TYPE;
                    $perm->name = $pname;
                    $perm->description = ucfirst($pname).' '.$type.' "'.$item->username.'"';
                    $perm->data = $item->id;
                    R::store($perm);
                }
                break;
            case GROUP_BEAN:
                array_push($perms,'member');
                foreach ($perms as $pname) {
                    $perm = R::dispense(PERMISSION_BEAN);
                    $perm->type = $app->const->GROUP_TYPE;
                    $perm->name = $pname;
                    $perm->description = ucfirst($pname).' '.$type.' "'.$item->name.'"';
                    $perm->data = $item->id;
                    R::store($perm);
                }
                break;
        }
    }

    static function assocObj($perm) {
        $app = \Slim\Slim::getInstance();
        //print_r($perm);
        switch ($perm['type']) {
            case $app->const->QUIZ_TYPE:
                $obj = R::getCell('SELECT name from '.QUIZ_BEAN.' WHERE id=?',[$perm['data']]);
                $obj = $obj?json_decode($obj):null;
                $obj = $obj?$obj->int:'';
                break;
            case $app->const->USER_TYPE:
                $obj = R::getCell('SELECT username from '.USER_BEAN.' WHERE id=?',[$perm['data']]);
                break;
            case $app->const->GROUP_TYPE:
                $obj = R::getCell('SELECT name from ['.GROUP_BEAN.'] WHERE id=?',[$perm['data']]);
                break;
            case $app->const->OPERATION_TYPE:
                $obj = null;
                break;          
            default:
                break;
        }

        return $obj;
    }
    
    static function getDefaultPermissions($type) {
        $app = \Slim\Slim::getInstance();
        switch ($type) {
            case $app->const->QUIZ_TYPE: return $app->const->DEFAULT_PERMISSIONS_FOR_QUIZ;
            case $app->const->USER_TYPE: return $app->const->DEFAULT_PERMISSIONS_FOR_USER;
            case $app->const->GROUP_TYPE: return $app->const->DEFAULT_PERMISSIONS_FOR_GROUP;
            case $app->const->OPERATION_TYPE: return [];
        };
    }
    
    static function typeName($type) {
        $app = \Slim\Slim::getInstance();
        switch ($type) {
            case $app->const->QUIZ_TYPE:return 'quiz';
            case $app->const->USER_TYPE:return 'user';
            case $app->const->GROUP_TYPE:return 'group';
            case $app->const->OPERATION_TYPE:return 'operation';
        }        
    }
}
