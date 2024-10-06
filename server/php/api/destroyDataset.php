<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];

    $input = json_decode(file_get_contents('php://input'), true);
    
    if($method != "DELETE") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }

    // Token Validation.
    if(!isset($input['token'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Token is not set."]);
        exit;
    }

    if(!token_exists($input['token'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Token doesn't exist."]);
        exit;
    }

    // Folder Validation.
    if(!isset($input['folder'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a folder type."]);
        exit;
    }

    $folder = $input['folder'];

    if($folder != "private" && $folder != "public") {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a folder type."]);
        exit;
    }

    // Dataset Validation.
    if(!isset($input['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a dataset to delete."]);
        exit;
    }

    $file = $input['file'];
    $delete = false;

    if($folder == "public") {

        $query = 'select public_permission from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $input['token']);
        $st->execute();
        $res = $st->get_result();
        $public_permission = $res->fetch_assoc()['public_permission']; 
        
        if($public_permission == 0) {
            header("HTTP/1.1 403 Forbidden");
            print json_encode(['errormesg'=>"You aren't allowed to delete public datasets."]);
            exit;
        }
        
        $file_path = "../../py/public/datasets/$file";
    
        if(!file_exists($file_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Dataset doesn't exist."]);
            exit;
        }
        
        $delete = unlink($file_path);
    }
    else {

        $email = user_mail($input['token']);
        $hash_user = md5($email);

        $file_path = "../../py/users/$hash_user/datasets/$file";

        if(!file_exists($file_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Dataset doesn't exist."]);
            exit;
        }
        
        $delete = unlink($file_path);
    }
    
    if(!$delete) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Unable to delete this dataset."]);
        exit;
    }

    print json_encode(['message'=>"Dataset successfully deleted."]);
?>