<?php
require_once '../php/components/QMail.php';

$app->post('/mail', function () use ($app) {
    //$app->config('debug', true);  
	$post = (Object)$app->request->post();
	$mailer = new QMail();
    $mailer->prepare($post);
	$result = $mailer->send();
	
	$app->response()->header('Content-Type', 'application/json');
	echo json_encode($result);
});

$app->get('/mail/invite/:userid/:quizid', function ($userId, $quizId) use ($app) {
    $app->response()->header('Content-Type', 'application/json');
    $mailer = new QMail();
    
    $body = file_get_contents(TEMPLATES_DIR.'email'.DS.'invitation.html');
    
    $data = (Object)[
        'user' => $userId, 
        'quiz' => $quizId,
        'title' => 'Take this survey',
        'html' => $body,
        'to' => User::emailById($userId)
    ];
    $invitation = R::findOne(QUIZ_INVITATION_BEAN,'quiz_id=? AND user_id=?',[$quizId, $userId]);
    if (!empty($invitation)) {
        $invitation->count++;
        $invitation->modified = date('Y-m-d H:i:s');
    } else {
        $invitation = R::dispense(QUIZ_INVITATION_BEAN);
        $invitation->quiz_id = $quizId;
        $invitation->user_id = $userId;
        $invitation->sender_id = $app->user->id;
        $invitation->count = 1;
        $invitation->created = date('Y-m-d H:i:s');
        $invitation->modified = date('Y-m-d H:i:s');        
    }
    R::store($invitation);
    
    $mailer->invite($data);
    $result = $mailer->send();
    echo json_encode($result);
});

$app->get('/mail', function () use ($app) {
	
		$address = 'oprean@gmail.com';
		$mail = new PHPMailer();
		$mail->CharSet = 'UTF-8';
		$mail->IsSMTP();
		$mail->SMTPAuth = true;
		$mail->SMTPSecure = 'ssl';
		$mail->Host = "smtp.gmail.com";
		$mail->Port = 465;
		$mail->IsHTML(true);
	
		$mail->Username = SMTP_USERNAME;
		$mail->Password = SMTP_PASSWORD;
		$mail->SetFrom(SMTP_SETFROM_MAIL,SMTP_SETFROM_NAME);
	
                $mail->SMTPDebug = 2;
                
		$mail->Subject = 'test email';
		$mail->Body = 'test';
		
		$mail->AddAddress($address);
		 if($mail->Send()) {
			$result = array(
				'status' => 'success',
				'data' => array(
					'message' => 'Mail succesfully sent to <i>'. $address.'</i>!' 
				)
			); 
		} else {
			$result = array(
				'status' => 'error',
				'data' => array(
					'message' => 'Failed to send the email to <i>'. $address.'</i>!',
				)
			);
		}
			
	$app->response()->header('Content-Type', 'application/json');
	echo json_encode($result);
});