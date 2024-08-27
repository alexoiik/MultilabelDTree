<?php
    require_once "../dbconnect.php";
    // require_once "../global_functions.php";
    
    $method = $_SERVER['REQUEST_METHOD'];

    if($method != "GET") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }

    // if(!isset($_GET['token'])) {
    //     header("HTTP/1.1 400 Bad Request");
    //     print json_encode(['errormesg'=>"Token is not set."]);
    //     exit;
    // }

    // if(!token_exists($_GET['token'])) {
    //     header("HTTP/1.1 400 Bad Request");
    //     print json_encode(['errormesg'=>"Token doesn't exist."]);
    //     exit;
    // }

    // $email = user_mail($_GET['token']);
    // $hash_user = md5($email);

    // $path = "../../py/users/$hash_user/unclassified_datasets";
    $path = "../../py/users/unclassified_datasets";

    $unclassified_data = [];
    $data = glob($path . '/' . '*');
    foreach($data as $d) {
        array_push($unclassified_data, basename($d));
    }

    print json_encode(['unclassified_data'=>$unclassified_data]);
?>