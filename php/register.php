<?php
/**
 * register.php
 * Endpoint for User Registration.
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

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$phone = trim($data['phone'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all registration fields: name, email, phone, password."
    ]);
    exit;
}

try {
    // Check if user already exists
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $checkStmt->execute([':email' => $email]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "An account with this email address already exists."
        ]);
        exit;
    }

    // In a production app, use password_hash(). In this educational setup, we'll hash it.
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insertStmt = $pdo->prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (:name, :email, :phone, :hash)");
    $insertStmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':hash' => $passwordHash
    ]);

    $userId = $pdo->lastInsertId();

    echo json_encode([
        "success" => true,
        "message" => "User account created successfully! You can now log in.",
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "phone" => $phone
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Registration failed: " . $e->getMessage()
    ]);
}
?>
