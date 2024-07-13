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

    if(!isset($_GET['folder'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a folder type."]);
        exit;
    }

    $folder = $_GET['folder'];

    if($folder != "private" && $folder != "public") {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a folder type."]);
        exit;
    }

    if(!isset($_GET['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a dataset to download."]);
        exit;
    }

    $file = $_GET['file'];

    $file_path = "";

    if($folder == "public") {
        $file_path = "../../py/public/datasets/$file";

        if(!file_exists($file_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"File doesn't exist."]);
            exit;
        }
    }
    else {
        // $email = user_mail($_GET['token']);

        // $hash_user = md5($email);
        // $file_path = "../../py/users/$hash_user/datasets/$file";

        // if(!file_exists($file_path)){
        //     header("HTTP/1.1 400 Bad Request");
        //     print json_encode(['errormesg'=>"File doesn't exist."]);
        //     exit;
        // }
    }

    header("Content-Description: File Transfer");
    header('Content-Disposition: attachment; filename="' . $file . '"');
    header("Content-Transfer-Encoding: Binary");

    readfile($file_path);
?>