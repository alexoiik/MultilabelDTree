<?php
    // Function to return domain name.
    function getdomain() {
        if(gethostname() == 'nireas') {
            $d = 'https://kclusterhub.iee.ihu.gr/MultilabelDTree';
        }
        else {
            $d = 'http://localhost/MultilabelDTree';
        }
        return $d;
    }

    // Function to check verification key's existance.
    function verif_key_exists($verif_key) {
        global $mysqli;
        $query = 'select count(*) as c from verify_account where verif_key=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $verif_key);
        $st->execute();
        $res = $st->get_result();
        $count = $res->fetch_assoc()['c'];
        if($count > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // Function to check verification key's expiration.
    function verif_key_expired($verif_key) {
        global $mysqli;
        $query = 'select count(*) as c from verify_account where verif_key=? and creation_time < (NOW() - INTERVAL 5 MINUTE)';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $verif_key);
        $st->execute();
        $res = $st->get_result();
        $count = $res->fetch_assoc()['c'];
        if($count > 0) {
            $query3 = 'select u.email as address from users u join verify_account va on u.id=va.user_id where va.verif_key=? and va.creation_time < (NOW() - INTERVAL 5 MINUTE)';
            $st3 = $mysqli->prepare($query3);
            $st3->bind_param('s', $verif_key);
            $st3->execute();
            $res3 = $st3->get_result();
            $address = $res3->fetch_assoc()['address'];
            return $address;
        }
        else {
            return null;
        }
    }

    // Function to check token's expiration.
    function token_exists($token) {
        global $mysqli;
        $query = 'select count(*) as c from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $token);
        $st->execute();
        $res = $st->get_result();
        $count = $res->fetch_assoc()['c'];
        if($count > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // Function to delete specific directories.
    function deleteDir($pathName) {
        array_map(fn (string $file) => is_dir($file) ? deleteDir($file) : unlink($file), glob($pathName . '/' . '*'));
        $dir4 = rmdir($pathName);
        if($dir4) {
            return true;
        }
        else {
            return false;
        }
    }

    // Function to return user's email.
    function user_mail($token) {
        global $mysqli;
        $query = 'select email from users where token=?';
        $st = $mysqli->prepare($query);
        $st->bind_param('s', $token);
        $st->execute();
        $res = $st->get_result();
        $email = $res->fetch_assoc()['email'];
        return $email;
    }
?>