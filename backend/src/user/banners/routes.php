<?php
declare(strict_types=1);

/** ภาพแบนเนอร์หน้าแรก เอาเฉพาะอันที่แอดมินเปิดใช้งาน เรียงตามลำดับที่ตั้งไว้ */
function user_banner_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/banners') return false;

    $banners = app_db()->query('SELECT id, title, image_path FROM banners WHERE is_active = 1 ORDER BY display_order, id')->fetchAll();

    json_response(['data' => array_map(static fn (array $banner) => [
        'id' => (int) $banner['id'],
        'title' => $banner['title'],
        'imageUrl' => public_url($banner['image_path']),
    ], $banners)]);
}
