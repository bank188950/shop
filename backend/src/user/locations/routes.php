<?php
declare(strict_types=1);

function user_location_route(string $method, string $path): bool
{
    if ($method !== 'GET' || $path !== '/user/locations') return false;

    $locations = app_db()->query('SELECT id, name FROM locations WHERE is_active = 1 ORDER BY name ASC')->fetchAll();
    json_response(['data' => array_map(fn (array $location) => ['id' => (int) $location['id'], 'name' => $location['name']], $locations)]);
}
