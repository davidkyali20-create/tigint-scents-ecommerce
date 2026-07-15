<?php
/**
 * create_order.php
 * Handles cart checkouts, simulates Safaricom Daraja STK Push,
 * and records orders and their line items in MySQL.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

// Retrieve POST request payload
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

$customerName = $data['customerName'] ?? '';
$customerPhone = $data['customerPhone'] ?? '';
$mpesaPhone = $data['mpesaPhone'] ?? '';
$deliveryMethod = $data['deliveryMethod'] ?? '';
$locationDetails = $data['locationDetails'] ?? '';
$deliveryCost = (float)($data['deliveryCost'] ?? 0.00);
$items = $data['items'] ?? [];

if (empty($customerName) || empty($customerPhone) || empty($mpesaPhone) || empty($items)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required checkout parameters (name, phone, mpesa number, or cart items)."
    ]);
    exit;
}

// Generate unique order ID e.g. TS-4921
$orderId = 'TS-' . rand(1000, 9999);

// Simulate STK Push request tracking variables
$checkoutRequestId = 'ws_CO_' . bin2hex(random_bytes(6));
$mpesaReceipt = 'MP_' . strtoupper(bin2hex(random_bytes(4)));

// Calculate total cart sum
$subtotal = 0;
foreach ($items as $item) {
    $subtotal += (float)$item['totalPrice'];
}
$totalAmount = $subtotal + $deliveryCost;

try {
    // Start transaction to insert orders and items securely
    $pdo->beginTransaction();

    // 1. Insert parent order
    $orderQuery = "INSERT INTO orders (
        id, customer_name, customer_phone, mpesa_phone, delivery_method, 
        location_details, delivery_cost, total_amount, payment_status, 
        mpesa_receipt, checkout_request_id, created_at
    ) VALUES (
        :id, :name, :phone, :mpesa, :method, :details, :cost, :total, 'paid', :receipt, :checkout, NOW()
    )";

    $orderStmt = $pdo->prepare($orderQuery);
    $orderStmt->execute([
        ':id' => $orderId,
        ':name' => $customerName,
        ':phone' => $customerPhone,
        ':mpesa' => $mpesaPhone,
        ':method' => $deliveryMethod,
        ':details' => $locationDetails,
        ':cost' => $deliveryCost,
        ':total' => $totalAmount,
        ':receipt' => $mpesaReceipt,
        ':checkout' => $checkoutRequestId
    ]);

    // 2. Insert line items
    $itemQuery = "INSERT INTO order_items (
        order_id, product_id, size_label, selected_scent, quantity, price_each, total_price
    ) VALUES (
        :order_id, :product_id, :size, :scent, :qty, :price, :total_price
    )";
    $itemStmt = $pdo->prepare($itemQuery);

    foreach ($items as $item) {
        $itemStmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $item['productId'],
            ':size' => $item['selectedSize'] ?? 'Standard',
            ':scent' => $item['selectedScent'] ?? null,
            ':qty' => (int)$item['quantity'],
            ':price' => (float)$item['priceEach'],
            ':total_price' => (float)$item['totalPrice']
        ]);
    }

    // Commit transaction
    $pdo->commit();

    // Respond with success payload
    echo json_encode([
        "success" => true,
        "message" => "Checkout completed and M-PESA STK push simulated successfully.",
        "order" => [
            "id" => $orderId,
            "totalAmount" => $totalAmount,
            "mpesaReceipt" => $mpesaReceipt,
            "checkoutRequestId" => $checkoutRequestId,
            "delivery" => [
                "method" => $deliveryMethod,
                "phone" => $customerPhone,
                "location" => $locationDetails
            ]
        ]
    ]);

} catch (\Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while creating order: " . $e->getMessage()
    ]);
}
?>
