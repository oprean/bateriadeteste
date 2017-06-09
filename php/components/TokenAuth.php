<?php

require_once (ROOT_DIR . '/vendor/slim/slim/Slim/Middleware.php');

class TokenAuth extends \Slim\Middleware {

    private $_public_uri = array(
        '/',
        '/page/',
        '/lang/',
        '/activate/',
        '/login',
        '/logout',
        '/results'
    );

    public function __construct() {
        
    }

    /**
     * Deny Access
     */
    public function deny_access() {
        $res = $this->app->response();
        $res->status(401);
    }

    private function _isPublicUri($uri) {
        foreach ($this->_public_uri as $public_uri) {
            if (strpos($public_uri, $uri) !== false)
                return true;
        }
        return false;
    }

    /**
     * Check against the DB if the token is valid
     * 
     * @param string $token
     * @return bool
     */
    public function authenticate($token) {
        return AppUser::validateToken($token);
    }

    /**
     * Call
     */
    public function call() {
        if (!$this->_isPublicUri($this->app->request->getResourceUri())) {
            if (!empty($_SESSION['bdt.user']['token']) && $this->authenticate($_SESSION['bdt.user']['token'])) {
                AppUser::keepTokenAlive($_SESSION['bdt.user']['token']);
                $this->next->call();
            } else {
                $this->app->response->redirect('login', 302);
            }
        } else {
            $this->next->call();
        }
    }

}
