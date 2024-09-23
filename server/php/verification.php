<?php
    require_once "dbconnect.php";
    require_once "global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];

    if($method != "GET") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }
    
    // Verification Key Validation.
    if(!isset($_GET['verif_key'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key is not set."]);
        exit;
    }

    $verif_key = $_GET['verif_key'];

    if(!verif_key_exists($verif_key)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key doesn't exist."]);
        exit;
    }

    $email = verif_key_expired($verif_key);
    if($email != null) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Verification key expired.", 'email' => $email]);
        exit;
    }

    // Storing Info to the database, related to the User's Account Verification.
    $query = 'update users u join verify_account va on u.id=va.user_id set u.email_verification=1 where va.verif_key=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $verif_key);
    $st->execute();

    $query2 = 'delete from verify_account where verif_key=?';
    $st2 = $mysqli->prepare($query2);
    $st2->bind_param('s', $verif_key);
    $st2->execute();   
    
    print json_encode(['message'=>"Successfully verified."]);
?>