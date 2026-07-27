<?php
declare(strict_types=1);

function product_base_query(): string
{
    return 'SELECT p.id, p.category_id, c.name AS category_name, c.tracks_piece_quantity,
        p.unit_id, u.name AS unit_name, p.name, p.description, p.image_path, p.sale_price,
        p.stock_quantity, p.stock_piece_count, p.pieces_per_sale, p.low_stock_threshold, p.is_recommended, p.is_active,
        p.created_at, p.updated_at
        FROM products p
        INNER JOIN product_categories c ON c.id = p.category_id
        INNER JOIN product_units u ON u.id = p.unit_id';
}

function product_to_api(array $product): array
{
    $stockQuantity = (int) $product['stock_quantity'];

    return [
        'id' => (int) $product['id'],
        'name' => $product['name'],
        'description' => $product['description'] ?? '',
        'imageUrl' => public_url($product['image_path']),
        'categoryId' => (int) $product['category_id'],
        'categoryName' => $product['category_name'],
        'tracksPieceQuantity' => (bool) $product['tracks_piece_quantity'],
        'unitId' => (int) $product['unit_id'],
        'unitName' => $product['unit_name'],
        'salePrice' => (float) $product['sale_price'],
        'stockPieceCount' => (int) $product['stock_piece_count'],
        'stockQuantity' => $stockQuantity,
        'piecesPerSale' => (int) $product['pieces_per_sale'],
        'lowStockThreshold' => (int) $product['low_stock_threshold'],
        'isRecommended' => (bool) $product['is_recommended'],
        'isActive' => (bool) $product['is_active'],
        'stockStatus' => $stockQuantity <= (int) $product['low_stock_threshold'] ? 'low' : 'available',
    ];
}

function product_low_stock_count(PDO $db): int
{
    return (int) $db->query('SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold')->fetchColumn();
}

function product_list(PDO $db, int $page, int $perPage): array
{
    $total = (int) $db->query('SELECT COUNT(*) FROM products')->fetchColumn();
    $statement = $db->prepare(product_base_query() . ' ORDER BY p.created_at DESC, p.id DESC LIMIT :limit OFFSET :offset');
    $statement->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $statement->bindValue(':offset', ($page - 1) * $perPage, PDO::PARAM_INT);
    $statement->execute();

    return [
        'data' => array_map('product_to_api', $statement->fetchAll()),
        'meta' => [
            'page' => $page,
            'perPage' => $perPage,
            'total' => $total,
            'totalPages' => max(1, (int) ceil($total / $perPage)),
            'lowStock' => product_low_stock_count($db),
        ],
    ];
}

function product_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare(product_base_query() . ' WHERE p.id = :id');
    $statement->execute(['id' => $id]);
    $product = $statement->fetch();
    return $product ?: null;
}

function product_references_exist(PDO $db, array $data): array
{
    $errors = [];
    $category = $db->prepare('SELECT id FROM product_categories WHERE id = :id');
    $category->execute(['id' => $data['category_id']]);
    if (!$category->fetchColumn()) $errors['category_id'] = 'ไม่พบหมวดสินค้าที่เลือก';

    $unit = $db->prepare('SELECT id FROM product_units WHERE id = :id');
    $unit->execute(['id' => $data['unit_id']]);
    if (!$unit->fetchColumn()) $errors['unit_id'] = 'ไม่พบหน่วยสินค้าที่เลือก';

    return $errors;
}

function product_apply_category_stock_rule(PDO $db, array $data): array
{
    $statement = $db->prepare('SELECT tracks_piece_quantity FROM product_categories WHERE id = :id');
    $statement->execute(['id' => $data['category_id']]);

    if (!(bool) $statement->fetchColumn()) {
        $data['stock_piece_count'] = 0;
        $data['pieces_per_sale'] = 0;
        return $data;
    }

    $data['stock_quantity'] = $data['pieces_per_sale'] > 0 ? intdiv($data['stock_piece_count'], $data['pieces_per_sale']) : 0;
    return $data;
}

function product_insert(PDO $db, array $data): int
{
    $statement = $db->prepare('INSERT INTO products (category_id, unit_id, name, description, image_path, sale_price, stock_quantity, stock_piece_count, pieces_per_sale, low_stock_threshold, is_recommended, is_active)
        VALUES (:category_id, :unit_id, :name, :description, :image_path, :sale_price, :stock_quantity, :stock_piece_count, :pieces_per_sale, :low_stock_threshold, :is_recommended, :is_active)');
    $statement->execute($data);
    return (int) $db->lastInsertId();
}

function product_update(PDO $db, int $id, array $data): void
{
    $data['id'] = $id;
    $statement = $db->prepare('UPDATE products SET category_id = :category_id, unit_id = :unit_id, name = :name, description = :description, image_path = :image_path, sale_price = :sale_price, stock_quantity = :stock_quantity, stock_piece_count = :stock_piece_count, pieces_per_sale = :pieces_per_sale, low_stock_threshold = :low_stock_threshold, is_recommended = :is_recommended, is_active = :is_active WHERE id = :id');
    $statement->execute($data);
}

function product_remove(PDO $db, int $id): void
{
    $statement = $db->prepare('DELETE FROM products WHERE id = :id');
    $statement->execute(['id' => $id]);
}
