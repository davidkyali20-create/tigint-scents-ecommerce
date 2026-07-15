<?php
/**
 * add_product.php
 * Endpoint for Admin to insert a new product and optional price variants.
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
$category = trim($data['category'] ?? '');
$description = trim($data['description'] ?? '');
$image = trim($data['image'] ?? '');
$badge = trim($data['badge'] ?? '');
$price = isset($data['price']) ? (float)$data['price'] : null;
$sizes = $data['sizes'] ?? [];

if (empty($name) || empty($category) || empty($description) || empty($image)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Required parameters missing: name, category, description, image."
    ]);
    exit;
}

$productId = 'prod_' . rand(1000, 9999);

try {
    $pdo->beginTransaction();

    // 1. Insert core product
    $stmt = $pdo->prepare("INSERT INTO products (id, name, category, description, image_url, badge, is_available) VALUES (:id, :name, :category, :description, :image_url, :badge, 1)");
    $stmt->execute([
        ':id' => $productId,
        ':name' => $name,
        ':category' => $category,
        ':description' => $description,
        ':image_url' => $image,
        ':badge' => empty($badge) ? null : $badge
    ]);

    // 2. Insert variants
    if ($category === 'oil_wholesale' && !empty($sizes)) {
        $variantStmt = $pdo->prepare("INSERT INTO product_variants (product_id, size_label, price) VALUES (:prod_id, :size, :price)");
        foreach ($sizes as $sz) {
            $variantStmt->execute([
                ':prod_id' => $productId,
                ':size' => $sz['size'],
                ':price' => (float)$sz['price']
            ]);
        }
    } else {
        $variantStmt = $pdo->prepare("INSERT INTO product_variants (product_id, size_label, price) VALUES (:prod_id, 'Standard', :price)");
        $variantStmt->execute([
            ':prod_id' => $productId,
            ':price' => $price !== null ? $price : 0.00
        ]);
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Product added successfully to inventory!",
        "product" => [
            "id" => $productId,
            "name" => $name,
            "category" => $category,
            "description" => $description,
            "image" => $image,
            "badge" => $badge,
            "isAvailable" => true
        ]
    ]);

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to add product: " . $e->getMessage()
    ]);
}
?>
