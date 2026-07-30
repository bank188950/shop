<?php
declare(strict_types=1);

const USER_ORDER_SLIP_MAX_ATTEMPTS = 3;

/** QR แสดงเฉพาะตอนที่ยังรอชำระเงิน และคืน null เมื่อยังไม่ได้ตั้งพร้อมเพย์ปลายทางในตาราง settings */
function user_order_payment_qr(array $settings, array $order): ?string
{
    if (($order['payment_status'] ?? '') !== 'pending' || ($order['order_status'] ?? '') === 'cancelled') return null;

    $proxyType = (string) ($settings['payment_promptpay_type'] ?? '');
    $proxyValue = (string) ($settings['payment_promptpay_id'] ?? '');
    if (!$proxyType || !$proxyValue) return null;

    return promptpay_payload($proxyType, $proxyValue, (float) $order['total_amount']);
}

/** เก็บไฟล์สลิปไว้ใน storage ไม่ใช่ public เพราะเป็นเอกสารการเงินของลูกค้า ต้องไม่เปิดให้เข้าถึงจาก URL ตรง ๆ */
function user_order_slip_store(?array $file): array
{
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) json_response(['message' => 'กรุณาแนบรูปสลิปการโอนเงิน'], 422);
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) json_response(['message' => 'อัปโหลดรูปสลิปไม่สำเร็จ กรุณาลองใหม่'], 422);
    if (($file['size'] ?? 0) > 5 * 1024 * 1024) json_response(['message' => 'รูปสลิปต้องมีขนาดไม่เกิน 5 MB'], 422);

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
    if (!isset($extensions[$mimeType])) json_response(['message' => 'รองรับเฉพาะไฟล์ JPG และ PNG'], 422);

    $directory = dirname(__DIR__, 3) . '/storage/slips';
    if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
        json_response(['message' => 'ไม่สามารถเตรียมโฟลเดอร์เก็บรูปสลิปได้'], 500);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mimeType];
    $fullPath = $directory . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $fullPath)) json_response(['message' => 'ไม่สามารถบันทึกรูปสลิปได้'], 500);

    return ['path' => 'storage/slips/' . $filename, 'fullPath' => $fullPath, 'mimeType' => $mimeType];
}

/** ต้องส่งเงื่อนไขไปทุกครั้ง ถ้าไม่ส่ง Slip2Go จะตรวจแค่ว่าสลิปมีจริงในระบบธนาคาร ไม่เทียบยอดและบัญชีปลายทางกับคำสั่งซื้อ */
function user_order_slip_conditions(array $settings, float $amount): array
{
    return [
        'checkDuplicate' => true,
        'checkReceiver' => [[
            'accountType' => (string) $settings['payment_slip_account_type'],
            'accountNumber' => preg_replace('/\D/', '', (string) $settings['payment_account_number']),
        ]],
        // เอกสาร Slip2Go กำหนดว่าห้ามใส่ทศนิยม .00 และห้ามใส่ลูกน้ำ จึงตัดศูนย์ท้ายออกด้วยการแปลงผ่านตัวเลข
        'checkAmount' => ['type' => 'eq', 'amount' => (string) (0 + $amount)],
    ];
}

/** ยืนยันได้เฉพาะ 200000 กับ 200200 กรณีอื่นไม่เปลี่ยนสถานะคำสั่งซื้อ แล้วให้แอดมินตรวจต่อจาก verify_code ที่บันทึกไว้ */
function user_order_slip_outcome(string $code): array
{
    if (in_array($code, ['200000', '200200'], true)) return ['isPaid' => true, 'message' => 'ยืนยันการชำระเงินเรียบร้อยแล้วครับ'];

    $messages = [
        '200404' => 'ไม่พบข้อมูลสลิปนี้ในระบบธนาคาร กรุณาตรวจสอบว่าอัปโหลดรูปสลิปถูกใบและเห็นครบทั้งใบ',
        '200500' => 'สลิปนี้ตรวจสอบไม่ผ่าน กรุณาติดต่อแอดมิน',
        '200501' => 'สลิปนี้ถูกใช้ยืนยันการชำระเงินไปแล้ว กรุณาใช้สลิปของการโอนครั้งนี้',
        '200401' => 'บัญชีผู้รับในสลิปไม่ตรงกับบัญชีของร้าน แอดมินจะตรวจสอบให้ครับ',
        '200402' => 'ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ แอดมินจะตรวจสอบให้ครับ',
        '200403' => 'วันที่โอนในสลิปไม่ตรงกับเงื่อนไข แอดมินจะตรวจสอบให้ครับ',
    ];

    return ['isPaid' => false, 'message' => $messages[$code] ?? 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จแอดมินจะตรวจสอบให้ครับ'];
}

/** แปลงคำตอบของ Slip2Go เป็นค่าของคอลัมน์ใน order_payments โดยเวลาที่ได้เป็น GMT ต้องแปลงเป็นเวลาไทยก่อนบันทึก */
function user_order_slip_columns(array $result, string $imagePath): array
{
    $data = $result['data'];

    $transferredAt = null;
    if (!empty($data['dateTime'])) {
        $parsed = date_create_immutable((string) $data['dateTime']);
        if ($parsed) $transferredAt = $parsed->setTimezone(new DateTimeZone(date_default_timezone_get()))->format('Y-m-d H:i:s');
    }

    return [
        'slip_image_path' => $imagePath,
        'slip_reference_id' => isset($data['referenceId']) ? (string) $data['referenceId'] : null,
        'slip_trans_ref' => isset($data['transRef']) ? (string) $data['transRef'] : null,
        'slip_transferred_at' => $transferredAt,
        'slip_amount' => isset($data['amount']) ? (float) $data['amount'] : null,
        'slip_sender_name' => $data['sender']['account']['name'] ?? null,
        'slip_sender_bank' => $data['sender']['bank']['name'] ?? null,
        'slip_sender_account' => $data['sender']['account']['bank']['account'] ?? null,
        'slip_receiver_account' => $data['receiver']['account']['bank']['account'] ?? null,
        'verify_code' => $result['code'] ?: null,
        'verify_message' => $result['message'] ?: null,
    ];
}
