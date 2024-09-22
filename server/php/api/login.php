<?php
    require_once "../dbconnect.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if($method != "POST") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }
    
    // Form's Required Fields Validation.
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

    $email = $input['email'];
    $pass = $input['pass'];

    // Checking User's Account Information.
    $query = 'select * from users where email=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $email);
    $st->execute();
    $res = $st->get_result();
    $res = $res->fetch_assoc();

    if(empty($res)) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Account does not exist."]);
        exit;
    }

    if(!$res['email_verification']) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Email did not verified."]);
        exit;
    }

    if(!password_verify($pass, $res['pass'])) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Wrong password."]);
        exit;
    }

    $data = array(
        "email"=>$res['email'],
        "token"=>$res['token'],
        "fname"=>$res['fname'],
        "lname"=>$res['lname']
    );

    print json_encode($data, JSON_PRETTY_PRINT);
?>