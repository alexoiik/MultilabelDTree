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

    // File Validation.
    if(!isset($_GET['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a dataset."]);
        exit;
    }

    $file = $_GET['file'];

    // $email = user_mail($_GET['token']);
    // $hash_user = md5($email);
    
    // $file_path = "../../py/users/$hash_user/unclassified_datasets/$file";
    $file_path = "../../py/users/unclassified_datasets/$file";

    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    $countFields = 0;
    $num_fields = array(); // Only numerical fields (features).
    $fields = array();    // Only fields that have values 0, 1 only (labels).
    $csv_array = array();
    $row = 0;

    if(($open_file = fopen($file_path, "r")) !== FALSE) {
        
        while (($row_data = fgetcsv($open_file, 2048, ",")) !== FALSE) {
            // Empty rows validation. If such rows exist, exclude them from the dataset.
            if (array_filter($row_data)) {
                $countFields = count($row_data);
                for($i = 0; $i < $countFields; $i++){
                    $csv_array[$row][$i] = $row_data[$i];
                }
                $row++;
            }
        }
        fclose($open_file);

        // Check if csv_array (dataset) is small. Return an error if true.
        if((count($csv_array)) < 3) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Please select a larger dataset."]);
            exit;
        }
        
        // Storing numerical fields only without missing values (features).
        for ($j = 0; $j < $countFields; $j++) {
            $is_numeric = true;
            for ($i = 1; $i < count($csv_array); $i++) {
                $value = $csv_array[$i][$j];
                if ($value === "" || !is_numeric($value)) {
                    $is_numeric = false;
                    break;
                }
            }
            if ($is_numeric && $csv_array[0][$j] !== "") {
                array_push($num_fields, $csv_array[0][$j]);
            }
        }
        
        // Check if num_fields (features) is empty. Return an error if true.
        if (empty($num_fields)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "This dataset does not contain features."]);
            exit;
        }

        // Check if num_fields (features) is less than one. Return an error if true.
        if (count($num_fields) < 1) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "This dataset contains a small number of features."]);
            exit;
        }

        // Storing fields that have values 0, 1 only without missing values (labels).
        for ($j2 = 0; $j2 < $countFields; $j2++) {
            $is_binary = true;
            for ($i2 = 1; $i2 < count($csv_array); $i2++) {
                $value = $csv_array[$i2][$j2];
                if ($value === "" || !preg_match('/^[01]$/', $value)) {
                    $is_binary = false;
                    break;
                }
            }
            if ($is_binary && $csv_array[0][$j2] !== "" && !preg_match('/^Att/', $csv_array[0][$j2])) {
                array_push($fields, $csv_array[0][$j2]);
            }
        }

        // Check if fields (labels) is empty. Return an error if true.
        if (empty($fields)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "This dataset does not contain labels."]);
            exit;
        }

        // Check if fields (labels) is less than two. Return an error if true.
        if (count($fields) < 2) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "This dataset contains a small number of labels."]);
            exit;
        }
        
        print json_encode(['csv_array'=>$csv_array]);
    }
    else {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to read file."]);
        exit;
    }
?>