<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if($method != "POST") {
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

    // File Validation.
    if(!isset($input['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a dataset."]);
        exit;
    }

    $file = $input['file'];

    // Model Validation.
    if(!isset($input['model'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select model."]);
        exit;
    }

    $model = $input['model'];

    // Features Validation.
    if(!isset($input['features'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You didn't select any feature."]);
        exit;
    }

    $features = $input['features'];

    if(count($features) == 0) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You didn't select any feature."]);
        exit;
    }

    // Labels Validation.
    if(!isset($input['labels'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You didn't select any label."]);
        exit;
    }

    $labels = $input['labels'];

    if(count($labels) < 2) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You must select two or more labels."]);
        exit;
    }

    // Replacing.
    $features = str_replace(" ", "_", $features);
    $labels = str_replace(" ", "_", $labels);

    $email = user_mail($input['token']);
    $hash_user = md5($email);

    $file_path = "../../py/users/$hash_user/unclassified_datasets/$file";

    if(!file_exists($file_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"File doesn't exist."]);
        exit;
    }

    $model_path = "../../py/users/$hash_user/models/$model";

    if(!file_exists($model_path)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Model doesn't exist."]);
        exit;
    }

    $name = $file;
    $name = substr($name, 0, -4);

    $save_path = "../../py/users/$hash_user/models/$name" . "_classified.csv";

    $paths = glob("../../py/users/$hash_user/models/*.csv");
    if(count($paths) > 0) {
        foreach($paths as $p){
            $delete = unlink($p);
            if(!$delete){
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"An error has occured while trying to classify multilabel data."]);
                exit;
            }
        }
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

        // Model's Features Matching w/ the Unclassified Dataset's Features.
        $num_fields = str_replace(" ", "_", $num_fields); // Replacing.

        for($i = 0; $i < count($features); $i++) {
            $found = 0;
            for($j = 0; $j < count($num_fields); $j++){
                if($features[$i] == $num_fields[$j]){
                    $found++;
                }
            }
            if($found == 0) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Model's features should match Unclassified Dataset's features."]);
                exit;
            }
        }

        // Imploding.
        $featuresImplode = implode(",", $features);
        $labelsImplode = implode(",", $labels);

        $results;
        try {
            $results = shell_exec("python ../../py/classifyMultilabelData.py $file_path $featuresImplode $model_path $save_path $labelsImplode");
        } catch(Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for data multilabel classification. <br><br> Please check the given columns and try again."]);
            exit;
        }

        if(!$results || $results == null) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to run the Python module for data multilabel classification. <br><br> Please check the given columns and try again."]);
            exit;
        }

        if(!file_exists($save_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to classify multilabel data."]);
            exit;
        }
        
        print($results);
    }
    else {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to read file."]);
        exit;
    }
?>