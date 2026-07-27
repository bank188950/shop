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
    return $db->query($sql . ' ORDER BY created_at DESC, id DESC')->fetchAll();
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
    $statement = $db->prepare('INSERT INTO product_categories (name, tracks_piece_quantity, is_active) VALUES (:name, :tracks_piece_quantity, :is_active)');
    $statement->execute($data);
    return (int) $db->lastInsertId();
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
