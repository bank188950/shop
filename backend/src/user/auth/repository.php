<?php
declare(strict_types=1);

function customer_auth_to_api(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['full_name'],
        'phone' => $user['phone'],
        'lineId' => $user['line_account'] ?? '',
        'locationId' => $user['default_location_id'] ? (int) $user['default_location_id'] : null,
        'locationName' => $user['location_name'] ?? '',
    ];
}

function customer_auth_find_by_id(PDO $db, int $id): ?array
{
    $statement = $db->prepare("SELECT u.id, u.full_name, u.phone, u.line_account, u.default_location_id, u.is_active, l.name AS location_name FROM users u LEFT JOIN locations l ON l.id = u.default_location_id WHERE u.id = :id AND u.role = 'customer' LIMIT 1");
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function customer_auth_find_by_phone(PDO $db, string $phone): ?array
{
    $statement = $db->prepare("SELECT u.id, u.full_name, u.phone, u.line_account, u.password_hash, u.default_location_id, u.is_active, l.name AS location_name FROM users u LEFT JOIN locations l ON l.id = u.default_location_id WHERE u.phone = :phone AND u.role = 'customer' LIMIT 1");
    $statement->execute(['phone' => $phone]);
    return $statement->fetch() ?: null;
}

function customer_auth_phone_exists(PDO $db, string $phone): bool
{
    $statement = $db->prepare('SELECT id FROM users WHERE phone = :phone');
    $statement->execute(['phone' => $phone]);
    return (bool) $statement->fetchColumn();
}

function customer_auth_active_location_exists(PDO $db, int $locationId): bool
{
    $statement = $db->prepare('SELECT id FROM locations WHERE id = :id AND is_active = 1');
    $statement->execute(['id' => $locationId]);
    return (bool) $statement->fetchColumn();
}

function customer_auth_register(PDO $db, array $data): int
{
    $statement = $db->prepare("INSERT INTO users (role, full_name, phone, line_account, password_hash, default_location_id, is_active) VALUES ('customer', :full_name, :phone, :line_account, :password_hash, :default_location_id, 1)");
    $statement->execute([
        'full_name' => $data['full_name'],
        'phone' => $data['phone'],
        'line_account' => $data['line_account'],
        'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
        'default_location_id' => $data['default_location_id'],
    ]);
    return (int) $db->lastInsertId();
}

function customer_auth_mark_login(PDO $db, int $id): void
{
    $statement = $db->prepare('UPDATE users SET last_login_at = NOW() WHERE id = :id');
    $statement->execute(['id' => $id]);
}
