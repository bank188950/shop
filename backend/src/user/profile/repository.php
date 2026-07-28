<?php
declare(strict_types=1);

function customer_profile_phone_is_taken(PDO $db, string $phone, int $exceptId): bool
{
    $statement = $db->prepare('SELECT id FROM users WHERE phone = :phone AND id != :id');
    $statement->execute(['phone' => $phone, 'id' => $exceptId]);
    return (bool) $statement->fetchColumn();
}

function customer_profile_update(PDO $db, int $id, array $data): void
{
    $statement = $db->prepare("UPDATE users SET full_name = :full_name, phone = :phone, line_account = :line_account, default_location_id = :default_location_id WHERE id = :id AND role = 'customer'");
    $statement->execute([
        'full_name' => $data['full_name'],
        'phone' => $data['phone'],
        'line_account' => $data['line_account'],
        'default_location_id' => $data['default_location_id'],
        'id' => $id,
    ]);
}
