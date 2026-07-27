<?php
declare(strict_types=1);

function admin_auth_to_api(array $admin): array
{
    return [
        'username' => $admin['username'],
        'name' => $admin['display_name'],
        'role' => $admin['role'],
        'avatarUrl' => $admin['avatar_filename'] ? public_url('uploads/admin-profiles/' . $admin['avatar_filename']) : null,
    ];
}

function admin_auth_find_by_username(PDO $db, string $username): ?array
{
    $statement = $db->prepare('SELECT id, username, password_hash, display_name, avatar_filename, role FROM `admin` WHERE username = :username AND role = \'super_admin\' LIMIT 1');
    $statement->execute(['username' => $username]);
    return $statement->fetch() ?: null;
}

function admin_auth_find_by_id(PDO $db, int $id): ?array
{
    $statement = $db->prepare('SELECT id, username, display_name, avatar_filename, role FROM `admin` WHERE id = :id AND role = \'super_admin\' LIMIT 1');
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function admin_auth_mark_login(PDO $db, int $id): void
{
    $statement = $db->prepare('UPDATE `admin` SET last_login_at = NOW() WHERE id = :id');
    $statement->execute(['id' => $id]);
}
