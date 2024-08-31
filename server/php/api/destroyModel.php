<?php
    require_once "../dbconnect.php";
    // require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if($method != "DELETE") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }

    // if(!isset($input['token'])) {
    //     header("HTTP/1.1 400 Bad Request");
    //     print json_encode(['errormesg'=>"Token is not set."]);
    //     exit;
    // }

    // if(!token_exists($input['token'])) {
    //     header("HTTP/1.1 400 Bad Request");
    //     print json_encode(['errormesg'=>"Token doesn't exist."]);
    //     exit;
    // }

    if(!isset($input['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a file to delete."]);
        exit;
    }

    $file = $input['file'];

    // $email = user_mail($input['token']);
    // $hash_user = md5($email);

    // $file_path = "../../py/users/$hash_user/models/$file"; # << CORRECT (for later addition)
    $file_path = "../../py/users/models/$file"; # << ΕΓΩ ΤΟ ΈΒΑΛΑ 
    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }
    
    $trf_file = str_replace('.pkl', '', $file);
    // $transformation_path = "../../py/users/transformations/$hash_user/" . $trf_file . "_transformation.pkl"; # << CORRECT (for later addition)
    $transformation_path = "../../py/users/transformations/" . $trf_file . "_transformation.pkl";
    if(!file_exists($transformation_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    $delete = unlink($file_path);
    if(!$delete) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Unable to delete this file."]);
        exit;
    }

    $delete2 = unlink($transformation_path);
    if(!$delete2) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Unable to delete this file."]);
        exit;
    }

        /* Database Manipulation Steps. */
    // 1) Getting the unique id from users table.
    $token = 'faketoken'; // fake token.
    $query = 'select id from users where token=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $token); // later addition: $input['token'] 
    $st->execute();
    $res = $st->get_result();
    $user_id = $res->fetch_assoc()['id'];
    
    // 2) Deleting the specific model from the models table.
    $query = 'delete from models where user_id=? and model_name=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('is', $user_id, $file);
    $st->execute();
    
    print json_encode(['message'=>"Model successfully deleted."]);
?>