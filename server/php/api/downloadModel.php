<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    // Token Validation.
    if(!isset($_GET['token'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Token is not set."]);
        exit;
    }

    if(!token_exists($_GET['token'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Token doesn't exist."]);
        exit;
    }

    // Model Validation.
    if(!isset($_GET['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a model to download."]);
        exit;
    }

    $file = $_GET['file'];

    $email = user_mail($_GET['token']);
    $hash_user = md5($email);

    $file_path = "../../py/users/$hash_user/models/$file";
    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Model doesn't exist."]);
        exit;
    }

    header("Content-Description: File Transfer");
    header('Content-Disposition: attachment; filename="' . $file . '"');
    header("Content-Transfer-Encoding: Binary");

    readfile($file_path);
?>