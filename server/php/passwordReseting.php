<?php
    require_once "dbconnect.php";
    require_once "global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'),true);
    
    if($method != "POST") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }

    // Verification Key Validation.
    if(!isset($input['verif_key'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key is not set."]);
        exit;
    }

    // New Password Validation.
    if(!isset($input['pass'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"New Password is Required."]);
        exit;
    }

    if(!isset($input['pass_confirm'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please Confirm New Password."]);
        exit;
    }

    $verif_key = $input['verif_key']; // User's Verification Key.
    $pass = $input['pass']; // User's New Password.
    $pass_confirm = $input['pass_confirm']; // User's New Confirmed Password.

    // Checking Verification Key Existance & Expiration.
    if(!verif_key_exists($verif_key)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key doesn't exist."]);
        exit;
    }

    $email = verif_key_expired($verif_key);
    if($email != null) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key expired."]);
        exit;
    }

    // New Password Validation.
    $uppercase = preg_match('@[A-Z]@', $pass);
    $lowercase = preg_match('@[a-z]@', $pass);
    $number = preg_match('@[0-9]@', $pass);

    if(!$uppercase || !$lowercase || !$number || strlen($pass) < 8) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Enter at least 8 characters, 1 uppercase letter & 1 number."]);
        exit;
    }

    if($pass != $pass_confirm) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Passwords do not match."]);
        exit;
    }

    $pass_hash = password_hash($pass, PASSWORD_BCRYPT); // Hashing New Password.

    // Password Reseting Query Manipulation in the database. 
    $query = 'update users u join verify_account va on u.id=va.user_id set u.pass=? where va.verif_key=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('ss', $pass_hash, $verif_key);
    $st->execute();

    $query2 = 'delete from verify_account where verif_key=?';
    $st2 = $mysqli->prepare($query2);
    $st2->bind_param('s', $verif_key);
    $st2->execute();
    
    print json_encode(['message'=>"Password successfully updated."]);
?>