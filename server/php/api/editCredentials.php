<?php
    require_once "../dbconnect.php";
    require_once "../global_functions.php";
    require_once "../phpmailer.php";

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

    if(isset($input['email'])) {

        $email = $input['email']; // Getting User's New Email.

        // Email Validation.
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Set a valid Email."]);
            exit;
        }
    
        $atPos = mb_strpos($email, '@');
        $domain = mb_substr($email, $atPos + 1);
        if(!checkdnsrr($domain . '.', 'MX')) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Set a valid Email."]);
            exit;
        }
    
        // Checking if Email exists or not.
        $query = 'select count(*) as c from users where email=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $email);
        $st->execute();
        $res = $st->get_result();
        $count = $res->fetch_assoc()['c'];
        if($count > 0) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Email already exists."]);
            exit;
        }

        // Getting User's Current/Old Email from the database.
        $query = 'select email from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $input['token']);
        $st->execute();
        $res = $st->get_result();
        $old_email = $res->fetch_assoc()['email'];
        
        // Updating User's Email from the database.
        $query = 'update users set email=?, email_verification=0 where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('ss', $email, $input['token']);
        $st->execute();

        $query = 'select id,fname from users where email=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $email);
        $st->execute();
        $res = $st->get_result();
        $res = $res->fetch_assoc();
        $id = $res['id'];
        $fname = $res['fname'];

        $query = 'delete from verify_account where id=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('i', $id);
        $st->execute();

        $verif_key = md5(random_bytes(16));
        $query = 'insert into verify_account(id,verif_key) values(?,?)';
        $st = $mysqli->prepare($query);
        $st->bind_param('is', $id, $verif_key);
        $st->execute();

        $hash_old_user = md5($old_email);
        $hash_user = md5($email);

        // Renaming User's directory, based on the new email.
        try {
            $dir1 = rename("../../py/users/$hash_old_user", "../../py/users/$hash_user");
        } catch(Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to rename user's directory."]);
            exit;
        }

        if(!$dir1) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"An error has occured while trying to rename user's directory."]);
            exit;
        }
        
        // New Email Verification Structure.
        $subject = 'New Email Verification - MultilabelDTree App';
        $domain2 = getdomain();
        $email_body = "Hello $fname!<br/>This is a New Email Verification.<br/>In order to update your email, please click <a href='$domain2/pages/verification.html?verif_key=$verif_key'>here</a> or paste the following to your browser: $domain2/pages/verification.html?verif_key=$verif_key";
        $alt_body = "Hello $fname!<br/>This is a New Email Verification.<br/>In order to update your email, please paste the following to your browser: $domain2/pages/verification.html?verif_key=$verif_key";
        
        try {
            send_mail($email, $fname, $subject, $email_body, $alt_body);
        } catch(Exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Mailer Error. Message could not be sent."]);
            exit;
        }

        print json_encode(['message'=>"Verification email sent."]);
    }
    else {

        // User's Information Validation.
        if(!isset($input['fname']) && !isset($input['lname']) && !isset($input['pass']) && !isset($input['new_pass']) && !isset($input['new_pass_confirm'])){
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"You must edit at least one field."]);
            exit;
        }

        // Getting User's Information.
        $query = 'select fname,lname,email,pass from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $input['token']);
        $st->execute();
        $res = $st->get_result();
        $res = $res->fetch_assoc();

        $old_fname = $res['fname']; // User's First Name.
        $old_lname = $res['lname']; // User's Last Name.
        $old_email = $res['email']; // User's Email.
        $old_pass = $res['pass']; // User's Password.

        $edited_columns = [];
        $edited_values = [];
        $data = array(
            "fname"=>null,
            "lname"=>null
        );

        // Updating User's First Name.
        if(isset($input['fname'])) {
            if($input['fname'] == $old_fname) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Enter a different First Name from the existing."]);
                exit;
            }
            array_push($edited_columns, "fname");
            array_push($edited_values, $input['fname']);
            $data['fname'] = $input['fname'];
        }

        // Updating User's Last Name.
        if(isset($input['lname'])) {
            if($input['lname'] == $old_lname) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Enter a different Last Name from the existing."]);
                exit;
            }
            array_push($edited_columns, "lname");
            array_push($edited_values, $input['lname']);
            $data['lname'] = $input['lname'];
        }

        // User's Password Validation.
        if(isset($input['pass']) && !isset($input['new_pass'])) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"New Password is Required."]);
            exit;
        }
        if(!isset($input['pass']) && isset($input['new_pass'])) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Current Password is Required."]);
            exit;
        }
        if(isset($input['pass']) && isset($input['new_pass']) && !isset($input['new_pass_confirm'])) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Please Confirm New Password."]);
            exit;
        }
        if(isset($input['new_pass_confirm']) && (!isset($input['pass']) || !isset($input['new_pass']))) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password fields are Required."]);
            exit;
        }

        // Updating User's Password.
        if(isset($input['pass']) && isset($input['new_pass']) && isset($input['new_pass_confirm'])) {

            // User's New Password Validation.
            if(!password_verify($input['pass'], $old_pass)) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Current Password is Incorrect."]);
                exit;
            }

            if($input['pass'] == $input['new_pass']) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Enter a different Password from the existing."]);
                exit;
            }

            $uppercase = preg_match('@[A-Z]@', $input['new_pass']);
            $lowercase = preg_match('@[a-z]@', $input['new_pass']);
            $number = preg_match('@[0-9]@', $input['new_pass']);

            if(!$uppercase || !$lowercase || !$number || strlen($input['new_pass']) < 8) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Enter at least 8 characters, 1 uppercase letter & 1 number."]);
                exit;
            }

            if($input['new_pass'] != $input['new_pass_confirm']) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=>"Passwords do not match."]);
                exit;
            }

            $pass_hash = password_hash($input['new_pass'], PASSWORD_BCRYPT);

            array_push($edited_columns, "pass");
            array_push($edited_values, $pass_hash);
        }

        $query2 = "";
        if(count($edited_columns) == 1) {
            $query2 = "update users set $edited_columns[0] = '$edited_values[0]' where token=?";
        } elseif(count($edited_columns) == 2) {
            $query2 = "update users set $edited_columns[0] = '$edited_values[0]', $edited_columns[1] = '$edited_values[1]' where token=?";
        } elseif(count($edited_columns) == 3) {
            $query2 = "update users set $edited_columns[0] = '$edited_values[0]', $edited_columns[1] = '$edited_values[1]', $edited_columns[2] = '$edited_values[2]' where token=?";
        }

        $st = $mysqli->prepare($query2);
        $st->bind_param('s', $input['token']);
        $st->execute();

        print json_encode($data, JSON_PRETTY_PRINT);
    }
?>