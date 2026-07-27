<?php
declare(strict_types=1);

function customer_message_to_api(array $message): array
{
    return [
        'id' => (int) $message['id'],
        'userId' => (int) $message['recipient_user_id'],
        'text' => $message['body'] ?? '',
        'imageUrl' => public_url($message['image_path']),
        'sentAt' => date(DATE_ATOM, strtotime($message['sent_at'])),
    ];
}

function customer_message_list(PDO $db, int $userId): array
{
    $statement = $db->prepare('SELECT id, recipient_user_id, body, image_path, sent_at FROM customer_messages WHERE recipient_user_id = :user_id ORDER BY sent_at, id');
    $statement->execute(['user_id' => $userId]);
    return $statement->fetchAll();
}

function customer_message_find(PDO $db, int $userId, int $messageId): ?array
{
    $statement = $db->prepare('SELECT id, recipient_user_id, body, image_path, sent_at FROM customer_messages WHERE id = :id AND recipient_user_id = :user_id');
    $statement->execute(['id' => $messageId, 'user_id' => $userId]);
    return $statement->fetch() ?: null;
}

function customer_message_insert(PDO $db, int $userId, array $data): int
{
    $statement = $db->prepare('INSERT INTO customer_messages (recipient_user_id, body, image_path) VALUES (:user_id, :body, :image_path)');
    $statement->execute(['user_id' => $userId, 'body' => $data['body'], 'image_path' => $data['image_path']]);
    return (int) $db->lastInsertId();
}

function customer_message_update(PDO $db, int $messageId, array $data): void
{
    $statement = $db->prepare('UPDATE customer_messages SET body = :body, image_path = :image_path, edited_at = CURRENT_TIMESTAMP WHERE id = :id');
    $statement->execute(['id' => $messageId, 'body' => $data['body'], 'image_path' => $data['image_path']]);
}

function customer_message_remove(PDO $db, int $messageId): void
{
    $statement = $db->prepare('DELETE FROM customer_messages WHERE id = :id');
    $statement->execute(['id' => $messageId]);
}
