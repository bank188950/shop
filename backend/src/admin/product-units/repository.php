<?php
declare(strict_types=1);

function unit_to_api(array $unit): array
{
    return ['id' => (int) $unit['id'], 'name' => $unit['name']];
}

function unit_list(PDO $db): array
{
    return $db->query('SELECT id, name FROM product_units ORDER BY name')->fetchAll();
}

function unit_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare('SELECT id, name FROM product_units WHERE id = :id');
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function unit_name_is_taken(PDO $db, string $name, ?int $exceptId): bool
{
    $sql = 'SELECT id FROM product_units WHERE name = :name';
    $params = ['name' => $name];
    if ($exceptId) {
        $sql .= ' AND id != :id';
        $params['id'] = $exceptId;
    }
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return (bool) $statement->fetchColumn();
}

function unit_insert(PDO $db, array $data): int
{
    $statement = $db->prepare('INSERT INTO product_units (name) VALUES (:name)');
    $statement->execute($data);
    return (int) $db->lastInsertId();
}

function unit_update(PDO $db, int $id, array $data): void
{
    $statement = $db->prepare('UPDATE product_units SET name = :name WHERE id = :id');
    $statement->execute(['id' => $id, ...$data]);
}

function unit_remove(PDO $db, int $id): void
{
    $statement = $db->prepare('DELETE FROM product_units WHERE id = :id');
    $statement->execute(['id' => $id]);
}
