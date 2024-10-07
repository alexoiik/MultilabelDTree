<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];

    if($method != "GET") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }
    
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
        print json_encode(['errormesg'=>"Please select a model."]);
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

    $results;
    try {
        $results = shell_exec("python ../../py/get_multilabelModel_content.py $file_path");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module."]);
        exit;
    }

    if(!$results || $results == null) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module."]);
        exit;
    }

        /* Database Manipulation Steps. */
    // 1) Getting the unique id from users table.
    $query = 'select id from users where token=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('s', $_GET['token']);
    $st->execute();
    $res = $st->get_result();
    $user_id = $res->fetch_assoc()['id'];
    
    // 2) Getting the unique id from models table.
    $query = 'select id from models where user_id=? and model_name=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('is', $user_id, $file);
    $st->execute();
    $res = $st->get_result();
    $model_id = $res->fetch_assoc()['id'];

    // 3) Getting the selected labels from labels table.
    $query = 'select label_name from labels where model_id=?';
    $st = $mysqli->prepare($query);
    $st->bind_param('i', $model_id);
    $st->execute();
    $res = $st->get_result();
    $labels = [];
    while ($row = $res->fetch_assoc()) {
        $labels[] = $row['label_name'];
    }
    
    $results = json_decode($results, true);
    $columns = $results['columns']; // Returning feature names (columns).
    $classifier_type = $results['classifier_type']; // Returning classifer type.
    $max_depth = $results['max_depth']; // Returning max_depth.
    $min_samples_leaf = $results['min_samples_leaf']; // Returning min_samples_leaf.

    // Returning results.
    print json_encode([
        'columns'=>$columns, 
        'classifier_type'=>$classifier_type,
        'max_depth'=>$max_depth,
        'min_samples_leaf'=> $min_samples_leaf,
        'labels'=> $labels
    ]);
?>