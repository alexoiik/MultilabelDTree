<?php
    require_once "dbconnect.php";
    require_once "global_functions.php";
    require_once "phpmailer.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if($method != "POST") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }

    // Validations for Resseting Forgotten Password.
    // 1. Email Validation!
    // 2. Account Validation!

    // Checking Email Exsistance.
    if(!isset($input['email'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Email is Required."]);
        exit;
    }
    $email = $input['email'];

    // Checking Account Existance.
    $query = 'select count(*) as c from users where email=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $email);
    $st->execute();
    $res = $st->get_result();
    $count = $res->fetch_assoc()['c'];
    if($count == 0) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Account does not exist."]);
        exit;
    }

    // Handling User's Reseting of Forgotten Password through Account Verification.
    $query = 'select id,fname from users where email=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $email);
    $st->execute();
    $res = $st->get_result();
    $res = $res->fetch_assoc();
    
    $id = $res['id']; // Getting User's ID.
    $fname = $res['fname']; // Getting User's First name.

    $query = 'select * from verify_account where user_id=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('i', $id);
    $st->execute();
    $res = $st->get_result();
    $res = $res->fetch_assoc();

    if(!empty($res)) {
        // Checking Email Resend Time Out & Handling User's Account Verification.
        $query = 'select count(*) as c from verify_account where user_id=? and creation_time < (NOW() - INTERVAL 2 MINUTE)';
        $st = $mysqli->prepare($query);
        $st->bind_param('i', $id);
        $st->execute();
        $res = $st->get_result();
        $count2 = $res->fetch_assoc()['c'];
        if($count2 == 0) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Email can be resent every 2 minutes."]);
            exit;
        }
        $query = 'delete from verify_account where user_id=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('i',$id);
        $st->execute();
    }
    
    $verif_key = md5(random_bytes(16));
    $query = 'insert into verify_account(user_id,verif_key) values(?,?)';
    $st = $mysqli->prepare($query);
    $st->bind_param('is', $id, $verif_key);
    $st->execute();

    // Reset Forgotten Password Email Structure.
    $subject = 'Reset Forgotten Password - MultilabelDTree App';
    $domain2 = getdomain();
    $email_body = "Hello $fname!<br/>This is a request message for resetting your forgotten password.<br/>To reset the password, please click <a href='$domain2/pages/passwordReseting.html?verif_key=$verif_key'>here</a> or paste the following to your browser: $domain2/pages/passwordReseting.html?verif_key=$verif_key";
    $alt_body = "Hello $fname!<br/>This is a request message for resetting your forgotten password.<br/>To reset the password, please paste the following to your browser: $domain2/pages/passwordReseting.html?verif_key=$verif_key";
    
    try {
        send_mail($email, $fname, $subject, $email_body, $alt_body);
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Mailer Error. Message could not be sent."]);
        exit;
    }

	print json_encode(['message'=>"Password resetting email sent."]);
?>