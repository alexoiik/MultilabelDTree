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

    // Deleting all .png files for a clean area storage. 
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

    // Deleting all .dot files for a clean area storage. 
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

    // $tree_path = "../../py/users/$hash_user/models/$name" . "_tree";
    $tree_path = "../../py/users/models/$name" . "_tree";

    $results;
    try {
        $results = shell_exec("python ../../py/visualize_ml_dtrees.py $trf_path $file_path $tree_path");
    } catch(Exception $e) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for DTrees Visualization"]);
        exit;
    }

    if(!$results || $results == null) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for DTrees Visualization"]);
        exit;
    }

    //$dotFiles = glob("../../py/users/$hash_user/models/*.dot"); 
    $dotFiles = glob("../../py/users/models/*.dot"); // Collecting all .dot files.
    $imagePaths = []; // Array to store all images.
    
    foreach ($dotFiles as $dotFile) {
        $name = basename($dotFile, ".dot"); // Getting the base name of the .dot file.
        // $pngFile = "../../py/users/models/$hash_user/$name" . ".png";
        $pngFile = "../../py/users/models/$name" . ".png"; // Setting the corresponding .png file.
        try {
            // shell_exec("/var/www/html/webkmeans/kclusterhub/multilabeldtree/miniconda3/bin/dot -Tpng $dotFile -o $pngFile");
            shell_exec("dot -Tpng $dotFile -o $pngFile"); // Converting the .dot file to a .png file.
        } catch(Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to render the DTrees."]);
            exit;
        }

        if (file_exists($pngFile)) {
            $domain = getdomain();
            // $imagePaths[] = "$domain/server/py/users/models/$hash_user/$name" . ".png";
            $imagePaths[] = "$domain/server/py/users/models/$name" . ".png";
        }
    }

    if (count($imagePaths) === 0) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg' => "No images for DTrees Visualization were generated."]);
        exit;
    }

    print json_encode(['images' => $imagePaths], JSON_UNESCAPED_SLASHES);
?>