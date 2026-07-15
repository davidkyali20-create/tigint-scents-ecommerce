<?php
/**
 * get_products.php
 * Fetches products and their size variants from the XAMPP MySQL Database.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db_connect.php';

try {
    // 1. Fetch core products
    $stmt = $pdo->query("SELECT id, name, category, description, image_url as image, badge FROM products");
    $products = $stmt->fetchAll();

    // 2. Fetch variants (sizes and prices)
    $variantStmt = $pdo->query("SELECT product_id, size_label, price FROM product_variants");
    $variants = $variantStmt->fetchAll();

    // Group variants by product
    $variantsByProduct = [];
    foreach ($variants as $v) {
        $variantsByProduct[$v['product_id']][] = [
            'size' => $v['size_label'],
            'price' => (float)$v['price']
        ];
    }

    // 3. Assemble products with variants and base pricing
    $responseProducts = [];
    foreach ($products as $p) {
        $productId = $p['id'];
        
        $productData = [
            'id' => $p['id'],
            'name' => $p['name'],
            'category' => $p['category'],
            'description' => $p['description'],
            'image' => $p['image'],
            'badge' => $p['badge']
        ];

        if (isset($variantsByProduct[$productId])) {
            if ($p['category'] === 'oil_wholesale') {
                // Wholesale oils use sizes array
                $productData['sizes'] = $variantsByProduct[$productId];
            } else {
                // Accessories or retail sprays might use a flat price
                $productData['price'] = (float)$variantsByProduct[$productId][0]['price'];
            }
        } else {
            // Fallback default flat price if no explicit variant matches
            $productData['price'] = 0;
        }

        $responseProducts[] = $productData;
    }

    echo json_encode([
        "success" => true,
        "products" => $responseProducts
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database Query Failed: " . $e->getMessage()
    ]);
}
?>
