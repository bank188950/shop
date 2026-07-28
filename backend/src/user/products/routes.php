<?php
declare(strict_types=1);

function customer_product_status(int $stockQuantity, int $lowStockThreshold): string
{
    if ($stockQuantity <= 0) return 'sold-out';
    if ($stockQuantity <= $lowStockThreshold) return 'low-stock';
    return 'in-stock';
}

function customer_product_to_api(array $product): array
{
    $stockQuantity = (int) $product['stock_quantity'];

    return [
        'id' => (int) $product['id'],
        'name' => $product['name'],
        'description' => $product['description'] ?? '',
        'imageUrl' => public_url($product['image_path']),
        'price' => (float) $product['sale_price'],
        'categoryId' => (int) $product['category_id'],
        'categoryName' => $product['category_name'],
        'unitName' => $product['unit_name'],
        'stockQuantity' => $stockQuantity,
        'isRecommended' => (bool) $product['is_recommended'],
        'status' => customer_product_status($stockQuantity, (int) $product['low_stock_threshold']),
    ];
}

function customer_product_route(string $method, string $path): bool
{
    if ($method !== 'GET') return false;
    $db = app_db();

    if ($path === '/user/products') {
        $products = $db->query('SELECT p.id, p.name, p.description, p.image_path, p.sale_price, p.stock_quantity, p.low_stock_threshold, p.is_recommended, p.category_id, c.name AS category_name, u.name AS unit_name
            FROM products p
            INNER JOIN product_categories c ON c.id = p.category_id
            INNER JOIN product_units u ON u.id = p.unit_id
            WHERE p.is_active = 1 AND c.is_active = 1
            ORDER BY (p.stock_quantity = 0) ASC, p.is_recommended DESC, p.id ASC')->fetchAll();
        json_response(['data' => array_map('customer_product_to_api', $products)]);
    }

    if ($path === '/user/product-categories') {
        $categories = $db->query('SELECT c.id, c.name FROM product_categories c
            WHERE c.is_active = 1 AND EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.id AND p.is_active = 1)
            ORDER BY c.id ASC')->fetchAll();
        json_response(['data' => array_map(fn (array $category) => ['id' => (int) $category['id'], 'name' => $category['name']], $categories)]);
    }

    return false;
}
