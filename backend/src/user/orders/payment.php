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
 * ส่งเฉพาะ checkAmount ให้ Slip2Go ตรวจ ส่วนบัญชีผู้รับตรวจเองใน user_order_slip_receiver_matches
 *
 * ไม่ใช้ checkReceiver เพราะสลิปที่โอนผ่านพร้อมเพย์คืน receiver.account.bank.account เป็น null
 * และ receiver.bank.id เป็น "000" (อื่นๆ) เนื่องจากสลิปไม่เปิดเผยธนาคารปลายทาง
 * เงื่อนไขของ Slip2Go จึงไม่มีค่าฝั่งสลิปให้เทียบและตอบ 200401 ทุกครั้งไม่ว่าจะส่งรูปแบบใดไป
 *
 * ไม่ใช้ checkDuplicate เพราะ Slip2Go นับสลิปที่เคยส่งไปตรวจว่าซ้ำ แม้ครั้งนั้นจะตรวจไม่ผ่าน
 * ทำให้สลิปที่ติดเงื่อนไขรอบแรกเอามาใช้กับคำสั่งซื้อที่ถูกต้องไม่ได้อีก จึงกันสลิปซ้ำด้วย unique key ของ slip_trans_ref ที่เราคุมเองแทน
 */
function user_order_slip_conditions(array $settings, float $amount): array
{
    return [
        // เอกสาร Slip2Go กำหนดว่าห้ามใส่ทศนิยม .00 และห้ามใส่ลูกน้ำ จึงตัดศูนย์ท้ายออกด้วยการแปลงผ่านตัวเลข
        'checkAmount' => ['type' => 'eq', 'amount' => (string) (0 + $amount)],
    ];
}

/**
 * เทียบผู้รับบนสลิปกับปลายทางของร้านเอง
 *
 * ธนาคารปิดบังปลายทางเหลือเห็นบางหลัก เช่นเบอร์ 083-029-1314 มาเป็น xxx-xxx-1314 และเลขบัญชีมาเป็น xxx-x-x5366-x
 * เทียบได้เพียงว่าหลักที่เห็นเป็นลำดับที่ปรากฏอยู่ในปลายทางของร้าน ซึ่งอ่อนกว่าการเทียบเต็มเลข
 * จึงต้องใช้ร่วมกับด่านยอดเงินตรงเป๊ะและด่านกันสลิปซ้ำ ไม่ใช้ด่านนี้ลำพัง
 */
function user_order_slip_receiver_matches(array $settings, array $data): bool
{
    $masked = (string) ($data['receiver']['account']['proxy']['account'] ?? $data['receiver']['account']['bank']['account'] ?? '');
    $visibleDigits = preg_replace('/\D/', '', $masked) ?? '';
    if (strlen($visibleDigits) < 4) return false;

    foreach ([$settings['payment_promptpay_id'] ?? '', $settings['payment_account_number'] ?? ''] as $identifier) {
        $digits = preg_replace('/\D/', '', (string) $identifier) ?? '';
        if ($digits && str_contains($digits, $visibleDigits)) return true;
    }

    return false;
}

/** ยืนยันได้เฉพาะ 200000 กับ 200200 ที่ผู้รับตรงกับร้านด้วย กรณีอื่นไม่เปลี่ยนสถานะคำสั่งซื้อ แล้วให้แอดมินตรวจต่อจาก verify_code ที่บันทึกไว้ */
function user_order_slip_outcome(array $result, array $settings): array
{
    $code = $result['code'];

    if (in_array($code, ['200000', '200200'], true)) {
        if (!user_order_slip_receiver_matches($settings, $result['data'])) {
            return ['isPaid' => false, 'message' => 'บัญชีผู้รับในสลิปไม่ตรงกับบัญชีของร้าน กรุณาแนบสลิปอีกครั้ง'];
        }
        return ['isPaid' => true, 'message' => 'ยืนยันการชำระเงินเรียบร้อยแล้วครับ'];
    }

    $messages = [
        '200404' => 'ไม่พบข้อมูลสลิปนี้ในระบบธนาคาร กรุณาตรวจสอบว่าเป็นสลิปถูกใบและเห็นครบทั้งใบ แล้วแนบสลิปอีกครั้ง',
        '200500' => 'สลิปนี้ตรวจสอบไม่ผ่าน กรุณาแนบสลิปอีกครั้ง',
        '200501' => 'สลิปนี้ถูกใช้ยืนยันการชำระเงินไปแล้ว กรุณาแนบสลิปของการโอนครั้งนี้',
        '200401' => 'บัญชีผู้รับในสลิปไม่ตรงกับบัญชีของร้าน กรุณาแนบสลิปอีกครั้ง',
        '200402' => 'ยอดเงินในสลิปไม่ตรงกับยอดที่ต้องชำระ กรุณาแนบสลิปอีกครั้ง',
        '200403' => 'วันที่โอนในสลิปไม่ตรงกับเงื่อนไข แอดมินจะตรวจสอบให้ครับ',
        '400409' => 'สลิปใบนี้เพิ่งถูกส่งตรวจไปแล้ว กรุณารอสักครู่แล้วแนบสลิปอีกครั้ง',
    ];

    if (isset($messages[$code])) return ['isPaid' => false, 'message' => $messages[$code]];

    // code กลุ่ม 401 คือคีย์ผิด แพ็กเกจหมดอายุ โทเคนหมด เครดิตไม่พอ หรือ IP ไม่ผ่าน และกลุ่ม 400 คือ request ที่เราส่งไม่ถูกต้อง
    // ทั้งสองกลุ่มเป็นปัญหาฝั่งร้าน การแนบสลิปใหม่ไม่ช่วยและจะกินโควตาไปเปล่า ๆ จึงต้องบอกลูกค้าตรง ๆ ว่าอย่าลองซ้ำ
    if (str_starts_with($code, '401') || str_starts_with($code, '400')) {
        return ['isPaid' => false, 'message' => 'ระบบตรวจสอบสลิปของร้านใช้งานไม่ได้ชั่วคราว ไม่ต้องแนบสลิปใหม่ แอดมินจะตรวจสอบให้ครับ'];
    }

    // ที่เหลือคือขัดข้องชั่วคราวจริง เช่นธนาคารล่ม ยิงถี่เกินลิมิต ระบบ Slip2Go พัง หรือเชื่อมต่อไม่ได้ ซึ่งรอแล้วลองใหม่ได้ผล
    return ['isPaid' => false, 'message' => 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว กรุณารอสักครู่แล้วแนบสลิปอีกครั้ง'];
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
