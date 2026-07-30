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

/**
 * ผู้รับบนสลิปถูกระบุตามช่องทางที่ลูกค้าโอนมา ถ้าสแกน QR พร้อมเพย์จะเป็นเบอร์ ถ้าพิมพ์เลขบัญชีเองจะเป็นเลขบัญชี
 * `checkReceiver` เป็น array ที่ใช้ตรรกะหรือ ตรงอย่างใดอย่างหนึ่งก็ถือว่าถูกต้อง จึงส่งทุกปลายทางที่เป็นของร้านไปให้ครบ
 * ทุกค่าที่ส่งเป็นปลายทางของร้านเองทั้งหมด การตรงกับค่าใดค่าหนึ่งจึงยืนยันได้ว่าเงินเข้าร้านจริง
 */
function user_order_receiver_candidates(array $settings): array
{
    $candidates = [];

    $accountNumber = preg_replace('/\D/', '', (string) ($settings['payment_account_number'] ?? '')) ?? '';
    if ($accountNumber) {
        $candidates[] = ['accountType' => (string) $settings['payment_slip_account_type'], 'accountNumber' => $accountNumber];
    }

    // ไม่ใส่ accountType ให้ปลายทางพร้อมเพย์ เพราะฟิลด์ใน object เดียวกันถูกตรวจแบบและ การใส่ประเภทผิดจะทำให้ไม่ตรงทั้ง object
    $promptpay = preg_replace('/\D/', '', (string) ($settings['payment_promptpay_id'] ?? '')) ?? '';
    if ($promptpay) {
        $candidates[] = ['accountNumber' => $promptpay];
        // เบอร์โทรบนสลิปอาจอยู่ในรูปรหัสประเทศ 13 หลักแบบเดียวกับที่ฝังใน QR จึงส่งไปด้วยอีกแบบ
        if (($settings['payment_promptpay_type'] ?? '') === 'msisdn' && strlen($promptpay) === 10) {
            $candidates[] = ['accountNumber' => '0066' . substr($promptpay, 1)];
        }
    }

    // ธนาคารปิดบังปลายทางบนสลิปเหลือเห็น 4 ตัวท้าย เช่นเบอร์ 083-029-1314 มาเป็น xxx-xxx-1314
    // ตัวอย่างในเอกสาร Slip2Go คือ "xxxxxx1234" ซึ่งเป็นรูปแบบที่ปิดบังแล้วตัดสัญลักษณ์ออก จึงส่งรูปแบบนี้ไปเทียบด้วย
    foreach ([$accountNumber, $promptpay] as $identifier) {
        if (strlen($identifier) >= 4) $candidates[] = ['accountNumber' => str_repeat('x', 6) . substr($identifier, -4)];
    }

    return $candidates;
}

/**
 * ต้องส่งเงื่อนไขไปทุกครั้ง ถ้าไม่ส่ง Slip2Go จะตรวจแค่ว่าสลิปมีจริงในระบบธนาคาร ไม่เทียบยอดและบัญชีปลายทางกับคำสั่งซื้อ
 * ไม่ส่ง checkDuplicate เพราะ Slip2Go นับสลิปที่เคยส่งไปตรวจแล้วว่าซ้ำ แม้ครั้งนั้นจะตรวจไม่ผ่าน
 * ทำให้สลิปที่ติดเงื่อนไขรอบแรกเอามาใช้กับคำสั่งซื้อที่ถูกต้องไม่ได้อีก เราจึงกันสลิปซ้ำด้วย unique key ของ slip_trans_ref ที่เราคุมเองแทน
 */
function user_order_slip_conditions(array $settings, float $amount): array
{
    return [
        'checkReceiver' => user_order_receiver_candidates($settings),
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
        '200401' => 'บัญชีผู้รับในสลิปไม่ตรงกับบัญชีของร้าน กรุณาลองใหม่อีกครั้ง',
        '200402' => 'ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ แอดมินจะตรวจสอบให้ครับ',
        '200403' => 'วันที่โอนในสลิปไม่ตรงกับเงื่อนไข แอดมินจะตรวจสอบให้ครับ',
        '400409' => 'สลิปใบนี้เพิ่งถูกส่งตรวจไปแล้ว กรุณารอสักครู่แล้วลองอีกครั้ง',
    ];

    return ['isPaid' => false, 'message' => $messages[$code] ?? 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จแอดมินจะตรวจสอบให้ครับ'];
}

/** แปลงคำตอบของ Slip2Go เป็นค่าของคอลัมน์ใน order_payments โดยเวลาที่ได้เป็น GMT ต้องแปลงเป็นเวลาไทยก่อนบันทึก */
function user_order_slip_columns(array $result, string $imagePath, bool $isPaid): array
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
        // เก็บเลขอ้างอิงธุรกรรมเฉพาะตอนตรวจผ่าน เพราะคอลัมน์นี้มี unique key ถ้าจองไว้ตอนตรวจไม่ผ่าน
        // สลิปใบเดิมจะเอาไปใช้กับคำสั่งซื้อที่ถูกต้องไม่ได้อีก
        'slip_trans_ref' => $isPaid && isset($data['transRef']) ? (string) $data['transRef'] : null,
        'slip_transferred_at' => $transferredAt,
        'slip_amount' => isset($data['amount']) ? (float) $data['amount'] : null,
        'slip_sender_name' => $data['sender']['account']['name'] ?? null,
        'slip_sender_bank' => $data['sender']['bank']['name'] ?? null,
        'slip_sender_account' => $data['sender']['account']['bank']['account'] ?? $data['sender']['account']['proxy']['account'] ?? null,
        // สลิปที่โอนผ่านพร้อมเพย์ระบุผู้รับเป็น proxy ไม่มี bank.account จึงต้องอ่านสำรองไว้ ไม่งั้นได้ค่าว่างทุกครั้ง
        'slip_receiver_account' => $data['receiver']['account']['bank']['account'] ?? $data['receiver']['account']['proxy']['account'] ?? null,
        'verify_code' => $result['code'] ?: null,
        'verify_message' => $result['message'] ?: null,
    ];
}

/** ลบไฟล์สลิปของการอัปโหลดครั้งก่อน เพราะฐานข้อมูลเก็บได้แถวเดียวต่อคำสั่งซื้อ ไฟล์เก่าจึงไม่มีใครอ้างถึงอีก */
function user_order_slip_delete(?string $imagePath): void
{
    if (!$imagePath || !str_starts_with($imagePath, 'storage/slips/')) return;
    $file = dirname(__DIR__, 3) . '/storage/slips/' . basename($imagePath);
    if (is_file($file)) unlink($file);
}
