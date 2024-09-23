<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";
    require_once "../phpmailer.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if($method != "POST") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }
    
    // Form's Required Fields Validation.
    if(!isset($input['fname'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"First Name is Required."]);
        exit;
    }

    if(!isset($input['lname'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Last Name is Required."]);
        exit;
    }

    if(!isset($input['email'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Email is Required."]);
        exit;
    }
    
    if(!isset($input['pass'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Password is Required."]);
        exit;
    }

    if(!isset($input['pass_confirm'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please Confirm Password."]);
        exit;
    }
    
    $fname = $input['fname'];
    $lname = $input['lname'];
    $email = $input['email'];
    $pass = $input['pass'];
    $pass_confirm = $input['pass_confirm'];

    // Email Validation.
    if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Set a valid Email."]);
        exit;
    }

    $atPos = mb_strpos($email, '@');
    $domain = mb_substr($email, $atPos + 1);
    if(!checkdnsrr($domain . '.', 'MX')) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Set a valid Email."]);
        exit;
    }

    // Checking if Email exists or not.
    $query = 'select count(*) as c from users where email=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $email);
    $st->execute();
    $res = $st->get_result();
    $count = $res->fetch_assoc()['c'];
    if($count > 0) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Email already exists."]);
        exit;
    }

    // Password Validation.
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

    $pass_hash = password_hash($pass, PASSWORD_BCRYPT); // Hashing Password.

    // Storing User's Info to the database.
    $query = 'insert into users(fname, lname, email, pass, token) values(?,?,?,?,md5(CONCAT( ?, NOW())))';
    $st = $mysqli->prepare($query);
    $st->bind_param('sssss', $fname, $lname, $email, $pass_hash, $fname);
    $st->execute();

    $query = 'select id from users where email=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $email);
    $st->execute();
    $res = $st->get_result();
    $id = $res->fetch_assoc()['id'];

    $verif_key = md5(random_bytes(16));
    $query = 'insert into verify_account(user_id, verif_key) values(?,?)';
    $st = $mysqli->prepare($query);
    $st->bind_param('is', $id, $verif_key);
    $st->execute();

    // Creating App's Secret Directories for the users.
    $hash_user = md5($email);
	try {
        $dir1 = mkdir("../../py/users/$hash_user");
        $dir2 = mkdir("../../py/users/$hash_user/datasets");
        $dir3 = mkdir("../../py/users/$hash_user/models");
        $dir4 = mkdir("../../py/users/$hash_user/transformations");
        $dir5 = mkdir("../../py/users/$hash_user/unclassified_datasets");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to create user's directory."]);
        exit;
    }

    if(!$dir1 || !$dir2 || !$dir3 || !$dir4 || !$dir5) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to create user's directory."]);
        exit;
    }
    
    // Account Verification Email Structure.
    $subject = 'Account Verification Email - MultilabelDTree App';
    $domain2 = getdomain();
    $email_body = "Hello $fname!<br/>This is an Account Verification Email.<br/>In order to complete your sign up to the MultilabelDTree App, please click <a href='$domain2/pages/verification.html?verif_key=$verif_key'>here</a> or paste the following to your browser: $domain2/pages/verification.html?verif_key=$verif_key";
    $alt_body = "Hello $fname!<br/>This is an Account Verification Email.<br/>In order to complete your sign up to the MultilabelDTree App, please paste the following to your browser: $domain2/pages/verification.html?verif_key=$verif_key";
    
    try {
        send_mail($email, $fname, $subject, $email_body, $alt_body);
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Mailer Error. Message could not be sent."]);
        exit;
    }

	print json_encode(['message'=>"User signed up successfully. Verification email sent."]);
?>