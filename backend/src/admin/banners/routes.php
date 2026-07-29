<?php
declare(strict_types=1);

function banner_route(string $method, string $path): bool
{
    $db = app_db();
    if ($method === 'GET' && $path === '/admin/banners') {
        json_response(['data' => array_map('banner_to_api', banner_list($db))]);
    }

    if ($method === 'POST' && preg_match('#^/admin/banners/(\d+)/move$#', $path, $moveMatches)) {
        $direction = (string) ($_POST['direction'] ?? '');
        if (!in_array($direction, ['up', 'down'], true)) json_response(['message' => 'ทิศทางการจัดลำดับไม่ถูกต้อง'], 422);
        if (!banner_find($db, (int) $moveMatches[1])) json_response(['message' => 'ไม่พบแบนเนอร์'], 404);
        banner_move($db, (int) $moveMatches[1], $direction);
        json_response(['data' => array_map('banner_to_api', banner_list($db))]);
    }

    if (!preg_match('#^/admin/banners/(\d+)$#', $path, $matches) && !($method === 'POST' && $path === '/admin/banners')) return false;
    $id = isset($matches[1]) ? (int) $matches[1] : null;

    if ($method === 'GET' && $id) {
        $banner = banner_find($db, $id);
        if (!$banner) json_response(['message' => 'ไม่พบแบนเนอร์'], 404);
        json_response(['data' => banner_to_api($banner)]);
    }
    if ($method === 'DELETE' && $id) {
        $banner = banner_find($db, $id);
        if (!$banner) json_response(['message' => 'ไม่พบแบนเนอร์'], 404);
        banner_remove($db, $id);
        banner_delete_image($banner['image_path']);
        json_response(['message' => 'ลบแบนเนอร์แล้ว']);
    }
    if ($method !== 'POST') return false;

    $current = $id ? banner_find($db, $id) : null;
    if ($id && !$current) json_response(['message' => 'ไม่พบแบนเนอร์'], 404);
    [$data, $errors] = banner_validate_input($_POST);
    if ($errors) json_response(['message' => 'ข้อมูลแบนเนอร์ไม่ถูกต้อง', 'errors' => $errors], 422);

    $newImagePath = banner_upload_image($_FILES['image'] ?? null);
    if (!$current && !$newImagePath) json_response(['message' => 'กรุณาเลือกรูปแบนเนอร์'], 422);
    $data['image_path'] = $newImagePath ?? $current['image_path'];

    try {
        if ($id) {
            banner_update($db, $id, $data);
            $bannerId = $id;
        } else {
            $bannerId = banner_insert($db, $data);
        }
    } catch (Throwable) {
        if ($newImagePath) banner_delete_image($newImagePath);
        json_response(['message' => 'ไม่สามารถบันทึกแบนเนอร์ได้'], 500);
    }

    if ($current && $newImagePath) banner_delete_image($current['image_path']);
    json_response(['data' => banner_to_api(banner_find($db, $bannerId))], $id ? 200 : 201);
}
