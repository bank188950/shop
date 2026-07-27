<?php
declare(strict_types=1);

function admin_profile_upload_avatar(?array $file): ?string
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) json_response(['message' => 'อัปโหลดรูปผู้ดูแลระบบไม่สำเร็จ'], 422);
    if (($file['size'] ?? 0) > 5 * 1024 * 1024) json_response(['message' => 'รูปผู้ดูแลระบบต้องมีขนาดไม่เกิน 5 MB'], 422);

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
    if (!isset($extensions[$mimeType])) json_response(['message' => 'รองรับเฉพาะไฟล์ JPG และ PNG'], 422);

    $directory = dirname(__DIR__, 3) . '/public/uploads/admin-profiles';
    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        json_response(['message' => 'ไม่สามารถเตรียมโฟลเดอร์เก็บรูปผู้ดูแลระบบได้'], 500);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mimeType];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
        json_response(['message' => 'ไม่สามารถบันทึกรูปผู้ดูแลระบบได้'], 500);
    }

    return $filename;
}

function admin_profile_delete_avatar(?string $filename): void
{
    if (!$filename || basename($filename) !== $filename) return;
    $file = dirname(__DIR__, 3) . '/public/uploads/admin-profiles/' . $filename;
    if (is_file($file)) unlink($file);
}
