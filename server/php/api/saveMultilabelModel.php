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

    // File Validation.
    if(!isset($input['file'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a dataset."]);
        exit;
    }

    $file = $input['file'];

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

    // Classifier Validation.
    if(!isset($input['classifier'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You didn't select any classifier."]);
        exit;
    }

    $classifier = $input['classifier'];

    if($classifier == 'default') {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please select a classifier."]);
        exit;
    }

    // Max Depth Validation.
    if(!isset($input['max_depth'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please give a Max Depth."]);
        exit;
    }

    $max_depth = $input['max_depth'];

    if($max_depth == 'None') {
        $max_depth = 'None';
    }
    else {
        $max_depth = intval($max_depth);
        if($max_depth < 1) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"You should give a Max Depth >= 1."]);
            exit;
        }
    }

    // Min Samples Leaf Validation.
    if(!isset($input['min_samples_leaf'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please give a Min Samples Leaf."]);
        exit;
    }

    $min_samples_leaf = $input['min_samples_leaf'];

    $min_samples_leaf = intval($min_samples_leaf);

    if($min_samples_leaf < 1) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"You should give a Min Samples Leaf >= 1."]);
        exit;
    }

    // Model Name Validation.
    if(!isset($input['model_name'])) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please give a name for your model."]);
        exit;
    }

    $model_name = $input['model_name'];
    
    if(strlen($model_name) == 0) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please give a name for your model."]);
        exit;
    }

    if(preg_match("@(^[^a-z]| )@i", $model_name)) {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"Please give a valid name for your model. <br><br> > First character should be a letter. <br/> > Spaces aren't allowed."]);
        exit;
    }

    $model_file_transformation = $model_name . "_transformation.pkl";
    $model_file = $model_name . ".pkl";

    $file_path = "";

    if($folder == "public") {

        $file_path = "../../py/public/datasets/$file";

        if(!file_exists($file_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Dataset doesn't exist."]);
            exit;
        }
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

        // Replacing.
        $features = str_replace(" ", "_", $features);
        $labels = str_replace(" ", "_", $labels);
        $classifier = str_replace(" ", "_", $classifier);
        
        // Imploding.
        $featuresImplode = implode(",", $features);
        $labelsImplode = implode(",", $labels);
        
        // Model's Existance Validation.
        $email = user_mail($input['token']);
        $hash_user = md5($email);

        $model_transformation = "../../py/users/$hash_user/transformations/$model_file_transformation";
        if(file_exists($model_transformation)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Model already exists. Try a different name."]);
            exit;
        }

        $model_path = "../../py/users/$hash_user/models/$model_file";
        if(file_exists($model_path)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Model already exists. Try a different name."]);
            exit;
        }

        $results;
        try {
            $results = shell_exec("python3 ../../py/save_multilabel_model.py $file_path $featuresImplode $labelsImplode $max_depth $min_samples_leaf $model_transformation $model_path $classifier");
        } catch(Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to run the python3 module. <br><br> Please check the possibility of missing values existence in given columns and try again."]);
            exit;
        }

        if(!$results || $results == null) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to run the python3 module. <br><br> Please check the possibility of missing values existence in given columns and try again."]);
            exit;
        }

            /* Database Manipulation Steps. */
        // 1) Getting the unique id from users table.
        $query = 'select id from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $input['token']);
        $st->execute();
        $res = $st->get_result();
        $user_id = $res->fetch_assoc()['id'];

        // 2) Inserting the transformation & the created model in the models table.
        $query = 'insert into models(user_id, transformation_approach, model_name) values(?,?,?)';
        $st = $mysqli->prepare($query);
        $st->bind_param('iss', $user_id, $model_file_transformation, $model_file);
        $st->execute();

        // 3) Getting the unique id from models table.
        $query = 'select id from models where model_name=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $model_file);
        $st->execute();
        $res = $st->get_result();
        $model_id = $res->fetch_assoc()['id'];

        // 4) Inserting the selected labels in the labels table.
        $labelsArray = explode(',', $labelsImplode);
        $query = 'insert into labels(model_id, label_name) values(?,?)';
        $st = $mysqli->prepare($query);
        foreach ($labelsArray as $label) {
            $st->bind_param('is', $model_id, $label);
            $st->execute();
        }

        // Printing the results.
        print($results);
    }
    else {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg'=>"An error has occured while trying to read file."]);
        exit;
    }
?>