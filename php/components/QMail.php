<?php

require_once('QPdf.php');

class QMail {

    private $_mail;
    private $_data;
    private $_pdf;

    function __construct() {

        $this->_mail = new PHPMailer(); // create a new object
        $this->_mail->CharSet = 'UTF-8';
        $this->_mail->IsSMTP(); // enable SMTP
        $this->_mail->SMTPAuth = true; // authentication enabled
        $this->_mail->SMTPSecure = 'ssl'; // secure transfer enabled REQUIRED for GMail
        $this->_mail->Host = SMTP_HOST;
        $this->_mail->Port = 465; // or 587
        $this->_mail->IsHTML(true);

        //$this->_mail->SMTPDebug = 2;

        $this->_mail->Username = SMTP_USERNAME;
        $this->_mail->Password = SMTP_PASSWORD;
        $this->_mail->SetFrom(SMTP_SETFROM_MAIL, SMTP_SETFROM_NAME);
    }

    function invite($data) {
        $this->_data = $data;
        $this->_data->to = User::emailById($data->user);
        $tmpl = R::findOne(TEMPLATE_BEAN, 'system = ? and type = ?', ['invitation','mail']);      
        
        $title = $tmpl->renderTitle($data);
        $html = $tmpl->renderContent($data);

        $this->_mail->Subject = $title;
        $this->_mail->Body = $html;
        $this->_mail->AddAddress($this->_data->to);
    }

    function prepare($data) {
        $this->_data = $data;
        $this->_data->filename = uniqid(preg_replace('/[^a-z0-9]/ui', '', $data->title)) . '.pdf';
        $this->_mail->Subject = $data->title;
        $this->_mail->Body = $data->html;
        $this->_mail->AddAddress($data->to);

        $this->_pdf = new QPdf($this->_data);
        $result = $this->_pdf->generate();
        $this->_mail->addAttachment($this->_pdf->GetFilename());
    }

    function send() {
        if ($this->_mail->Send()) {
            $result = array(
                'status' => 'success',
                'data' => array(
                    'message' => 'E-Mail trimis cu succes la <i>' . $this->_data->to . '</i>!'
                )
            );
        } else {
            $result = array(
                'status' => 'error',
                'data' => array(
                    'message' => 'Eroare de trimitere E-mail la <i>' . $this->_data->to . '</i>!'
                )
            );
        }
        if ($this->_pdf) {
            unlink($this->_pdf->GetFilename());
        }
        return $result;
    }

}
