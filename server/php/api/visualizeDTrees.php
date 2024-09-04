<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];
    
    if($method != "GET") {
        header("HTTP/1.1 405 Method Not Allowed");
        print json_encode(['errormesg'=>"Method not allowed."]);
        exit;
    }
    
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
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    $trf_file = str_replace('.pkl', '', $file);
    // $trf_path = "../../py/users/transformations/$hash_user/" . $trf_file . "_transformation.pkl";
    $trf_path = "../../py/users/transformations/" . $trf_file . "_transformation.pkl";

    if(!file_exists($trf_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    $name = $file;
    $name = substr($name, 0, -4);
    
    // $tree_path = "../../py/users/$hash_user/models/$name" . "_tree.png";
    $tree_path = "../../py/users/models/$name" . "_tree.png";
    // $tree_pathDot = "../../py/users/$hash_user/models/$name" . "_tree.dot";
    $tree_pathDot = "../../py/users/models/$name" . "_tree.dot";

    // $paths = glob("../../py/users/$hash_user/models/*.png");
    $paths = glob("../../py/users/models/*.png");
    if(count($paths) > 0) {
        foreach($paths as $p) {
            $delete = unlink($p);
            if(!$delete){
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"An error has occured while trying to Visualize DTrees - (ERROR 0)."]);
                exit;
            }
        }
    }

    // $pathsDot = glob("../../py/users/$hash_user/models/*.dot");
    $pathsDot = glob("../../py/users/models/*.dot");
    if(count($pathsDot) > 0) {
        foreach($pathsDot as $p) {
            $delete = unlink($p);
            if(!$delete){
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"An error has occured while trying to Visualize DTrees - (ERROR 1)."]);
                exit;
            }
        }
    }

    // $tree_path2 = "../../py/users/$hash_user/models/$name" . "_tree";
    $tree_path2 = "../../py/users/models/$name" . "_tree";

    $results;
    try {
        $results = shell_exec("python ../../py/visualize_ml_dtrees.py $trf_path $file_path $tree_path2");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for DTrees Visualization - (ERROR 2)."]);
        exit;
    }

    if(!$results || $results == null) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for DTrees Visualization - (ERROR 3)."]);
        exit;
    }

    if(!file_exists($tree_pathDot)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to Visualize DTrees."]);
        exit;
    }

    try {
        // shell_exec("/var/www/html/webkmeans/kclusterhub/multilabeldtree/miniconda3/bin/dot -Tpng $tree_pathDot -o $tree_path");
        shell_exec("dot -Tpng $tree_pathDot -o $tree_path");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to render the DTrees."]);
        exit;
    }

    if(!file_exists($tree_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to render the DTrees."]);
        exit;
    }

    $domain = getdomain();

    // $file2 = "$domain/server/py/users/$hash_user/models/$name" . "_tree.png";
    $file2 = "$domain/server/py/users/models/$name" . "_tree.png";
    print json_encode(['image'=>$file2], JSON_UNESCAPED_SLASHES);
?>