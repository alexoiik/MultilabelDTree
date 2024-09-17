<?php
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;

    require __DIR__.'/../../vendor/autoload.php';
    require 'mailer_config.php';

    function send_mail($recipient, $r_name, $subject, $body, $altbody){

        require 'mailer_config.php';
        $mail = new PHPMailer(true);

        try {
            $mail->SMTPDebug = 0;       
            $mail->isSMTP();            
            $mail->Host       = 'smtp-mail.outlook.com';   
            $mail->SMTPAuth   = true;                      
            $mail->SMTPOptions=array('ssl'=>array(
                'verify_peer'=>false,
                'verify_peer_name'=>false,
                'allow_self_signed'=>true
            ));
            
            $mail->Username   = $username;     
            $mail->Password   = $password;     
            $mail->SMTPSecure = 'tls';         
            $mail->Port       = 587;    

            $mail->setFrom($username, 'MultilabelDTree App');
            $mail->addAddress($recipient, $r_name);  
        
            $mail->isHTML(true);                     
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = $altbody;

            $mail->send();

        } catch (Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
            exit;
        }
    }
?>