<?php
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require __DIR__.'/../../vendor/autoload.php';
    require 'mailer_config.php';

    function send_mail($recipient, $r_name, $subject, $body, $altbody) {

        require 'mailer_config.php';
        $mail = new PHPMailer(true);

        try {
            // SMTP SetUp.
            $mail->SMTPDebug = 0;       
            $mail->isSMTP();            
            $mail->Host       = 'smtp.gmail.com';   
            $mail->SMTPAuth   = true;       
                           
            // SMTP Options.
            $mail->SMTPOptions=array(
                'ssl'=>array(
                    'verify_peer'=>false,
                    'verify_peer_name'=>false,
                    'allow_self_signed'=>true
                )
            );
            
            // Email Credentials & SMTP Info.
            $mail->Username   = $username;     
            $mail->Password   = $password;     
            $mail->SMTPSecure = 'tls';         
            $mail->Port       = 587;    

            // Email SetUp.
            $mail->setFrom($username, 'MultilabelDTree App');
            $mail->addAddress($recipient, $r_name);  
            $mail->isHTML(true);                     
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = $altbody;

            // Sending Email.
            $mail->send();

        } catch (Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Mailer Error: {$mail->ErrorInfo}"]);
            exit;
        }
    }
?>