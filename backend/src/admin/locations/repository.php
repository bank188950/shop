<?php
declare(strict_types=1);

function location_to_api(array $location): array
{
    return [
        'id' => (int) $location['id'],
        'name' => $location['name'],
        'isActive' => (bool) $location['is_active'],
    ];
}

function location_list(PDO $db): array
{
    return $db->query('SELECT id, name, is_active FROM locations ORDER BY created_at DESC, id DESC')->fetchAll();
}

function location_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare('SELECT id, name, is_active FROM locations WHERE id = :id');
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function location_name_is_taken(PDO $db, string $name, ?int $exceptId): bool
{
    $sql = 'SELECT id FROM locations WHERE name = :name';
    $params = ['name' => $name];
    if ($exceptId) {
        $sql .= ' AND id != :id';
        $params['id'] = $exceptId;
    }
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return (bool) $statement->fetchColumn();
}

function location_insert(PDO $db, array $data): int
{
    $statement = $db->prepare('INSERT INTO locations (name, is_active) VALUES (:name, :is_active)');
    $statement->execute($data);
    return (int) $db->lastInsertId();
}

function location_update(PDO $db, int $id, array $data): void
{
    $statement = $db->prepare('UPDATE locations SET name = :name, is_active = :is_active WHERE id = :id');
    $statement->execute(['id' => $id, ...$data]);
}

function location_remove(PDO $db, int $id): void
{
    $statement = $db->prepare('DELETE FROM locations WHERE id = :id');
    $statement->execute(['id' => $id]);
}
