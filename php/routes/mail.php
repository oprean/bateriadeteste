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