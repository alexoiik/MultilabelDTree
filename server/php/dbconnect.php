<?php
    require_once "db_upass.php";
    
    $host = $REMOTE_HOST;
    $db = $DB_SCHEMA;
    $user = $DB_USER;
    $pass = $DB_PASS;

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    if (gethostname() == 'nireas') {
        $mysqli = new mysqli($host, $user, $pass, $db);
    } else {
        $host = "localhost";
        $userlocal = $DB_USER_LOCAL;
        $pass = "";
        $db = "multilabeldtree_db";
        $mysqli = new mysqli($host, $userlocal, $pass, $db);
    }

    if ($mysqli->connect_errno) {
        echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
    }
?>