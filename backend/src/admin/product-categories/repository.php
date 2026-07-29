<?php
declare(strict_types=1);

function category_to_api(array $category): array
{
    return [
        'id' => (int) $category['id'],
        'name' => $category['name'],
        'tracksQuantity' => (bool) $category['tracks_piece_quantity'],
        'isActive' => (bool) $category['is_active'],
    ];
}

function category_list(PDO $db, bool $activeOnly = false): array
{
    $sql = 'SELECT id, name, tracks_piece_quantity, is_active FROM product_categories';
    if ($activeOnly) $sql .= ' WHERE is_active = 1';
    return $db->query($sql . ' ORDER BY display_order, id')->fetchAll();
}

function category_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare('SELECT id, name, tracks_piece_quantity, is_active FROM product_categories WHERE id = :id');
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function category_name_is_taken(PDO $db, string $name, ?int $exceptId): bool
{
    $sql = 'SELECT id FROM product_categories WHERE name = :name';
    $params = ['name' => $name];
    if ($exceptId) {
        $sql .= ' AND id != :id';
        $params['id'] = $exceptId;
    }
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return (bool) $statement->fetchColumn();
}

function category_insert(PDO $db, array $data): int
{
    $nextOrder = (int) $db->query('SELECT COALESCE(MAX(display_order), 0) + 1 FROM product_categories')->fetchColumn();
    $statement = $db->prepare('INSERT INTO product_categories (name, tracks_piece_quantity, is_active, display_order) VALUES (:name, :tracks_piece_quantity, :is_active, :display_order)');
    $statement->execute([...$data, 'display_order' => $nextOrder]);
    return (int) $db->lastInsertId();
}

/** สลับตำแหน่งกับหมวดที่อยู่ติดกัน แล้วเขียนลำดับใหม่ทั้งชุด กันค่า display_order ซ้ำหรือเป็น 0 */
function category_move(PDO $db, int $id, string $direction): void
{
    $categories = $db->query('SELECT id FROM product_categories ORDER BY display_order, id')->fetchAll();
    $index = array_search($id, array_map(static fn (array $category) => (int) $category['id'], $categories), true);
    if ($index === false) return;

    $target = $direction === 'up' ? $index - 1 : $index + 1;
    if ($target < 0 || $target >= count($categories)) return;
    [$categories[$index], $categories[$target]] = [$categories[$target], $categories[$index]];

    $statement = $db->prepare('UPDATE product_categories SET display_order = :display_order WHERE id = :id');
    foreach ($categories as $position => $category) $statement->execute(['display_order' => $position + 1, 'id' => $category['id']]);
}

function category_update(PDO $db, int $id, array $data): void
{
    $data['id'] = $id;
    $statement = $db->prepare('UPDATE product_categories SET name = :name, tracks_piece_quantity = :tracks_piece_quantity, is_active = :is_active WHERE id = :id');
    $statement->execute($data);
}

function category_remove(PDO $db, int $id): void
{
    $statement = $db->prepare('DELETE FROM product_categories WHERE id = :id');
    $statement->execute(['id' => $id]);
}
