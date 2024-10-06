<?php
    require_once "db_upass.php";

    $host = $REMOTE_HOST;
    $db = $DB_SCHEMA;
    $user_local = $DB_USER_LOCAL;
    $user_server = $DB_USER_SERVER;
    $pass = $DB_PASS;                   

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    
    if(gethostname()=='nireas') {
        $mysqli = new mysqli($host, $user_server, $pass, $db);
    } else {
        $host = 'localhost';
        $pass = null;
        $db = 'multilabeldtree_db';
        $mysqli = new mysqli($host, $user_local, $pass, $db);
    }

    if ($mysqli->connect_errno) {
        echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
    }
?>