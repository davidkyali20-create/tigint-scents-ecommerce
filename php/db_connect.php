<?php
/**
 * db_connect.php
 * Database Connection for Tigint Scents
 * Optimized for local XAMPP environment
 */

$host = 'localhost';
$dbname = 'tigint_scents';
$username = 'root';
$password = 'password123';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $username, $password, $options);
} catch (\PDOException $e) {
     // Output json error if database connection fails
     header('Content-Type: application/json');
     http_response_code(500);
     echo json_encode([
         "success" => false,
         "message" => "Database Connection Failed: " . $e->getMessage()
     ]);
     exit;
}
?>
