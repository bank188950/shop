<?php
declare(strict_types=1);

/**
 * ส่งรูปสลิปไปตรวจกับ Slip2Go ตาม contract ใน specs/payment-slip-verification.md
 * คืน code เป็นค่าว่างเมื่อเรียกปลายทางไม่ถึงหรืออ่านคำตอบไม่ได้ เพื่อให้ผู้เรียกแยกกรณีระบบขัดข้องออกจากผลตรวจได้
 */
function slip2go_verify_image(string $filePath, string $mimeType, array $conditions): array
{
    $baseUrl = rtrim((string) ($_ENV['SLIP2GO_BASE_URL'] ?? ''), '/');
    $apiKey = (string) ($_ENV['SLIP2GO_API_KEY'] ?? '');
    if (!$baseUrl || !$apiKey) {
        return ['code' => '', 'message' => 'ยังไม่ได้ตั้งค่า SLIP2GO_BASE_URL หรือ SLIP2GO_API_KEY ใน .env', 'data' => []];
    }

    $handle = curl_init($baseUrl . '/api/verify-slip/qr-image/info');
    curl_setopt_array($handle, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $apiKey],
        CURLOPT_POSTFIELDS => [
            'file' => new CURLFile($filePath, $mimeType, 'slip.' . pathinfo($filePath, PATHINFO_EXTENSION)),
            'payload' => json_encode($conditions, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ],
    ]);
    $body = curl_exec($handle);
    $curlError = curl_error($handle);
    curl_close($handle);

    if ($body === false) return ['code' => '', 'message' => $curlError ?: 'เชื่อมต่อ Slip2Go ไม่ได้', 'data' => []];

    $decoded = json_decode((string) $body, true);
    if (!is_array($decoded)) return ['code' => '', 'message' => 'อ่านคำตอบจาก Slip2Go ไม่ได้', 'data' => []];

    return [
        'code' => (string) ($decoded['code'] ?? ''),
        'message' => (string) ($decoded['message'] ?? ''),
        'data' => is_array($decoded['data'] ?? null) ? $decoded['data'] : [],
    ];
}
