<?php
declare(strict_types=1);

function user_to_api(array $user): array
{
    return ['id' => (int) $user['id'], 'name' => $user['full_name'], 'phone' => $user['phone'], 'lineId' => $user['line_account'] ?? '', 'locationId' => $user['default_location_id'] ? (int) $user['default_location_id'] : null, 'locationName' => $user['location_name'] ?? '', 'isActive' => (bool) $user['is_active'], 'messageCount' => (int) ($user['message_count'] ?? 0)];
}

function user_list(PDO $db): array
{
    return $db->query("SELECT u.id, u.full_name, u.phone, u.line_account, u.default_location_id, u.is_active, l.name AS location_name, (SELECT COUNT(*) FROM customer_messages cm WHERE cm.recipient_user_id = u.id) AS message_count FROM users u LEFT JOIN locations l ON l.id = u.default_location_id WHERE u.role = 'customer' ORDER BY u.full_name, u.id")->fetchAll();
}

function user_find(PDO $db, int $id): ?array
{
    $statement = $db->prepare("SELECT u.id, u.full_name, u.phone, u.line_account, u.default_location_id, u.is_active, l.name AS location_name, (SELECT COUNT(*) FROM customer_messages cm WHERE cm.recipient_user_id = u.id) AS message_count FROM users u LEFT JOIN locations l ON l.id = u.default_location_id WHERE u.id = :id AND u.role = 'customer'");
    $statement->execute(['id' => $id]);
    return $statement->fetch() ?: null;
}

function user_phone_is_taken(PDO $db, string $phone, ?int $exceptId): bool
{
    $sql = 'SELECT id FROM users WHERE phone = :phone';
    $params = ['phone' => $phone];
    if ($exceptId) { $sql .= ' AND id != :id'; $params['id'] = $exceptId; }
    $statement = $db->prepare($sql);
    $statement->execute($params);
    return (bool) $statement->fetchColumn();
}

function user_location_exists(PDO $db, int $locationId): bool
{
    $statement = $db->prepare('SELECT id FROM locations WHERE id = :id');
    $statement->execute(['id' => $locationId]);
    return (bool) $statement->fetchColumn();
}

function user_insert(PDO $db, array $data): int
{
    $statement = $db->prepare("INSERT INTO users (role, full_name, phone, line_account, password_hash, default_location_id, is_active) VALUES ('customer', :full_name, :phone, :line_account, :password_hash, :default_location_id, :is_active)");
    $statement->execute(['full_name' => $data['full_name'], 'phone' => $data['phone'], 'line_account' => $data['line_account'], 'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT), 'default_location_id' => $data['default_location_id'], 'is_active' => $data['is_active']]);
    return (int) $db->lastInsertId();
}

function user_update(PDO $db, int $id, array $data): void
{
    $params = ['id' => $id, 'full_name' => $data['full_name'], 'phone' => $data['phone'], 'line_account' => $data['line_account'], 'default_location_id' => $data['default_location_id'], 'is_active' => $data['is_active']];
    $sql = 'UPDATE users SET full_name = :full_name, phone = :phone, line_account = :line_account, default_location_id = :default_location_id, is_active = :is_active';
    if ($data['password'] !== '') { $sql .= ', password_hash = :password_hash'; $params['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT); }
    $statement = $db->prepare($sql . ' WHERE id = :id AND role = \'customer\'');
    $statement->execute($params);
}

function user_remove(PDO $db, int $id): void
{
    customer_message_delete_user_images($db, $id);
    $statement = $db->prepare("DELETE FROM users WHERE id = :id AND role = 'customer'");
    $statement->execute(['id' => $id]);
}
