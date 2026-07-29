<?php
declare(strict_types=1);

function user_message_upload_image(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) json_response(['message' => 'อัปโหลดรูปข้อความไม่สำเร็จ'], 422);
    if (($file['size'] ?? 0) > 5 * 1024 * 1024) json_response(['message' => 'รูปข้อความต้องมีขนาดไม่เกิน 5 MB'], 422);

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mimeType])) json_response(['message' => 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP'], 422);

    $directory = dirname(__DIR__, 3) . '/public/uploads/user-messages';
    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        json_response(['message' => 'ไม่สามารถเตรียมโฟลเดอร์เก็บรูปข้อความได้'], 500);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mimeType];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
        json_response(['message' => 'ไม่สามารถบันทึกรูปข้อความได้'], 500);
    }

    return 'uploads/user-messages/' . $filename;
}

function user_message_delete_image(?string $imagePath): void
{
    if (!$imagePath || !str_starts_with($imagePath, 'uploads/user-messages/')) return;
    $file = dirname(__DIR__, 3) . '/public/uploads/user-messages/' . basename($imagePath);
    if (is_file($file)) unlink($file);
}
