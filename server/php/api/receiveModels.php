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
    
    // $models_path = "../../py/users/$hash_user/models"; # << CORRECT (for later addition)
    $models_path = "../../py/users/models"; # << ΕΓΩ ΤΟ ΈΒΑΛΑ 
    $models_data = getFiles($models_path);

    function getFiles($path){
        $data = [];
        $data2 = glob($path . '/' . '*' . '.pkl');
        foreach($data2 as $d2){
            array_push($data,basename($d2));
        }
        return $data;
    }

    print json_encode(['models_data'=>$models_data]);
?>