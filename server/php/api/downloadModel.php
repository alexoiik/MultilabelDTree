<?php
    require_once "../dbconnect.php";
    // require_once "../global_functions.php";

    if(!isset($_GET['token'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Token is not set."]);
        exit;
    }

    // if(!token_exists($_GET['token'])) {
    //     header("HTTP/1.1 400 Bad Request");
    //     print json_encode(['errormesg'=>"Token doesn't exist."]);
    //     exit;
    // }

    if(!isset($_GET['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select file to download."]);
        exit;
    }

    $file = $_GET['file'];

    // $email = user_mail($_GET['token']);
    // $hash_user = md5($email);

    // $file_path = "../../py/users/$hash_user/models/$file"; # << CORRECT (for later addition)
    $file_path = "../../py/users/$file"; # << ΕΓΩ ΤΟ ΈΒΑΛΑ 

    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    header("Content-Description: File Transfer");
    header('Content-Disposition: attachment; filename="' . $file . '"');
    header("Content-Transfer-Encoding: Binary");

    readfile($file_path);
?>