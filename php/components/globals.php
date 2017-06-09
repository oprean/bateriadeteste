<?php

function dump($target, $depth=10, $highlight = true) {
	echo CVarDumper::dumpAsString($target, $depth, $highlight);
}

function sanitize($string, $force_lowercase = true, $anal = false) {
    $strip = array("~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "=", "+", "[", "{", "]",
                   "}", "\\", "|", ";", ":", "\"", "'", "&#8216;", "&#8217;", "&#8220;", "&#8221;", "&#8211;", "&#8212;",
                   "â€”", "â€“", ",", "<", ".", ">", "/", "?");
    $clean = trim(str_replace($strip, "", strip_tags($string)));
    $clean = preg_replace('/\s+/', "-", $clean);
    $clean = ($anal) ? preg_replace("/[^a-zA-Z0-9]/", "", $clean) : $clean ;
    return ($force_lowercase) ?
        (function_exists('mb_strtolower')) ?
            mb_strtolower($clean, 'UTF-8') :
            strtolower($clean) :
        $clean;
}

function lang() {
	return isset($_SESSION['bdt.language'])
		?$_SESSION['bdt.language']
		:null;
}

function qtr($textObj, $lang) {
    return empty($textObj->$lang)?$textObj->int:$textObj->$lang;
}

function globaljs() {
	$globalData = [
		'DEBUG_MODE' => DEBUG_MODE,
		'user' => isset($_SESSION['bdt.user'])?$_SESSION['bdt.user']:null,
		'language' => isset($_SESSION['bdt.language'])
			?$_SESSION['bdt.language']
			:null
	];
	
	return json_encode($globalData);
}

function jsconstants() {
    
    $curlSession = curl_init();
    curl_setopt($curlSession, CURLOPT_URL, BASE_URL.'/js/components/Constants.js');
    curl_setopt($curlSession, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curlSession, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6"); // set browser/user agent  
    curl_setopt($curlSession, CURLOPT_BINARYTRANSFER, true);
    curl_setopt($curlSession, CURLOPT_RETURNTRANSFER, true);
    $data = curl_exec($curlSession);
    
    if ($data === false) {
        echo 'Curl error: ' . curl_error($curlSession);
    }
    
    curl_close($curlSession);
    
	preg_match('~.+/\*{JSON-START}\*/(?<json>.+)/\*{JSON-END}\*/.*~is', $data, $match);
	$data = substr($match['json'],0,-3);

	if (!empty($match)) return json_decode($data);
}
