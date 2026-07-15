<?php
/**
 * admin_login.php
 * Endpoint for Admin Login.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Malformed or empty JSON payload."
    ]);
    exit;
}

$email = strtolower(trim($data['email'] ?? ''));
$password = trim($data['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter email and password."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT email, password FROM admins WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    if (!$admin || $password !== $admin['password']) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid admin credentials."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "Admin authorized successfully!",
        "admin" => [
            "email" => $admin['email']
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Admin login failed: " . $e->getMessage()
    ]);
}
?>
