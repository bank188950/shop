<?php
declare(strict_types=1);

function admin_profile_ensure(PDO $db): void
{
    $statement = $db->prepare("INSERT INTO `admin` (id, username, display_name) VALUES (1, 'admin_user', 'Admin Profile') ON DUPLICATE KEY UPDATE id = id");
    $statement->execute();
}

function admin_profile_find(PDO $db): array
{
    admin_profile_ensure($db);
    return $db->query('SELECT id, username, display_name, avatar_filename FROM `admin` WHERE id = 1')->fetch();
}

function admin_profile_to_api(array $profile): array
{
    return [
        'username' => $profile['username'],
        'name' => $profile['display_name'],
        'avatarUrl' => $profile['avatar_filename'] ? public_url('uploads/admin-profiles/' . $profile['avatar_filename']) : null,
    ];
}

function admin_profile_update(PDO $db, array $data): void
{
    $statement = $db->prepare('UPDATE `admin` SET display_name = :display_name, avatar_filename = :avatar_filename WHERE id = 1');
    $statement->execute($data);
}
