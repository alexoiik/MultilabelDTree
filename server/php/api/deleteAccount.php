<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'),true);
    
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

    // User's Password Validation.
    if(!isset($input['pass_del'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Password is Required."]);
        exit;
    }
    if(!isset($input['pass_del_confirm'])){
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please Confirm Password."]);
        exit;
    }

    // Getting User's Information.
    $query = 'select id,pass,email from users where token=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $input['token']);
    $st->execute();
    $res = $st->get_result();
    $res = $res->fetch_assoc();

    $id = $res['id']; // User's ID.
    $pass = $res['pass']; // User's Password.
    $email = $res['email']; // User's Email.

    // User's Password Validation.
    if(!password_verify($input['pass_del'], $pass)) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Wrong password."]);
        exit;
    }
    if($input['pass_del'] != $input['pass_del_confirm']) {
        header("HTTP/1.1 400 Bad Request");
		print json_encode(['errormesg'=>"Passwords do not match."]);
        exit;
    }

    // Deleting User's Directories.
    $hash_user = md5($email);
    try {
        $dir2 = deleteDir("../../py/users/$hash_user/datasets");
        $dir3 = deleteDir("../../py/users/$hash_user/models");
        $dir4 = deleteDir("../../py/users/$hash_user/transformations");
        $dir5 = deleteDir("../../py/users/$hash_user/unclassified_datasets");
        $dir1 = rmdir("../../py/users/$hash_user");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to delete user's directory."]);
        exit;
    }

    if(!$dir1 || !$dir2 || !$dir3 || !$dir4 || !$dir5) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to delete user's directory."]);
        exit;
    }

    // Deleting User's Account & Related Information from the database.
    $query = 'delete from users where token=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $input['token']);
    $st->execute();

    print json_encode(['message'=>"Account successfully deleted."]);
?>