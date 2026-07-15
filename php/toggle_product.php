<?php
/**
 * toggle_product.php
 * Endpoint for Admin to toggle product availability (Available or Out of Stock).
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

$productId = trim($data['id'] ?? '');

if (empty($productId)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Product ID is required."
    ]);
    exit;
}

try {
    // Check if product exists and get its current status
    $stmt = $pdo->prepare("SELECT is_available FROM products WHERE id = :id");
    $stmt->execute([':id' => $productId]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Product not found."
        ]);
        exit;
    }

    $newStatus = $product['is_available'] ? 0 : 1;

    $updateStmt = $pdo->prepare("UPDATE products SET is_available = :status WHERE id = :id");
    $updateStmt->execute([
        ':status' => $newStatus,
        ':id' => $productId
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Product is now " . ($newStatus ? "Available" : "Out of Stock") . ".",
        "product" => [
            "id" => $productId,
            "isAvailable" => (bool)$newStatus
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to toggle product status: " . $e->getMessage()
    ]);
}
?>
