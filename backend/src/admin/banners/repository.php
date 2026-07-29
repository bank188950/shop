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
    $nextOrder = (int) $db->query('SELECT COALESCE(MAX(display_order), 0) + 1 FROM banners')->fetchColumn();
    $statement = $db->prepare('INSERT INTO banners (title, image_path, is_active, display_order) VALUES (:title, :image_path, :is_active, :display_order)');
    $statement->execute([...$data, 'display_order' => $nextOrder]);
    return (int) $db->lastInsertId();
}

/** สลับตำแหน่งกับแบนเนอร์ที่อยู่ติดกัน แล้วเขียนลำดับใหม่ทั้งชุด กันค่า display_order ซ้ำหรือเป็น 0 จากข้อมูลเก่า */
function banner_move(PDO $db, int $id, string $direction): void
{
    $banners = $db->query('SELECT id FROM banners ORDER BY display_order, id')->fetchAll();
    $index = array_search($id, array_map(static fn (array $banner) => (int) $banner['id'], $banners), true);
    if ($index === false) return;

    $target = $direction === 'up' ? $index - 1 : $index + 1;
    if ($target < 0 || $target >= count($banners)) return;
    [$banners[$index], $banners[$target]] = [$banners[$target], $banners[$index]];

    $statement = $db->prepare('UPDATE banners SET display_order = :display_order WHERE id = :id');
    foreach ($banners as $position => $banner) $statement->execute(['display_order' => $position + 1, 'id' => $banner['id']]);
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
