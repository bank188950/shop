<?php
declare(strict_types=1);

function banner_to_api(array $banner): array
{
    return [
        'id' => (int) $banner['id'],
        'title' => $banner['title'],
        'imageUrl' => public_url($banner['image_path']),
        'isActive' => (bool) $banner['is_active'],
    ];
}

function banner_list(PDO $db): array
{
    return $db->query('SELECT id, title, image_path, is_active FROM banners ORDER BY display_order, id')->fetchAll();
}

function banner_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare('SELECT id, title, image_path, is_active FROM banners WHERE id = :id');
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function banner_insert(PDO $db, array $data): int
{
    $statement = $db->prepare('INSERT INTO banners (title, image_path, is_active) VALUES (:title, :image_path, :is_active)');
    $statement->execute($data);
    return (int) $db->lastInsertId();
}

function banner_update(PDO $db, int $id, array $data): void
{
    $statement = $db->prepare('UPDATE banners SET title = :title, image_path = :image_path, is_active = :is_active WHERE id = :id');
    $statement->execute(['id' => $id, ...$data]);
}

function banner_remove(PDO $db, int $id): void
{
    $statement = $db->prepare('DELETE FROM banners WHERE id = :id');
    $statement->execute(['id' => $id]);
}
