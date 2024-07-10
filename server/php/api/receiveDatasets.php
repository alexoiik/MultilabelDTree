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

    $public_path = "../../py/public/datasets";
    $public_data = getFiles($public_path);

    // $email = user_mail($_GET['token']);
    // $hash_user = md5($email);
    
    // $private_path = "../../py/users/$hash_user/datasets";
    // $private_data = getFiles($private_path);

    function getFiles($path){
        $data = [];
        $data2 = glob($path . '/' . '*');
        foreach($data2 as $d2){
            array_push($data,basename($d2));
        }
        return $data;
    }

    // print json_encode(['public_data'=>$public_data,'private_data'=>$private_data]); # << CORRECT (for later addition)
    print json_encode(['public_data'=>$public_data]); # << ΕΓΩ ΤΟ ΈΒΑΛΑ 
?>