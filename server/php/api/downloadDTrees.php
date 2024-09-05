<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

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
        print json_encode(['errormesg'=>"Please select a model."]);
        exit;
    }

    $file = $_GET['file'];

    // $email = user_mail($_GET['token']);
    // $hash_user = md5($email);

    // $file_path = "../../py/users/$hash_user/models/$file";
    $file_path = "../../py/users/models/$file";

    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Model doesn't exist."]);
        exit;
    }

    $name = $file;
    $name = substr($name, 0, -4);

    // Finding all the .png tree files of the specific model.
    // $tree_files = glob("../../py/users/{$hash_user}/models/{$name}_tree*.png");
    $tree_files = glob("../../py/users/models/{$name}_tree*.png");
       
    if(empty($tree_files)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"DTrees Visualization doesn't exist."]);
        exit;
    }

    // Preparing an array of the .png tree files for downloading.
    $domain = getdomain();
    $download_urls = [];
    foreach ($tree_files as $tree_path) {
        $file_name = basename($tree_path);
        // $download_urls[] = "$domain/server/py/users/$hash_user/models/$file_name";
        $download_urls[] = "$domain/server/py/users/models/$file_name";
    }

    print json_encode(['download_urls' => $download_urls], JSON_UNESCAPED_SLASHES);
?>