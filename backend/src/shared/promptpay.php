<?php
declare(strict_types=1);

/** field ของ EMVCo คือ id 2 หลัก ต่อด้วยความยาว 2 หลัก ต่อด้วยค่า */
function promptpay_field(string $id, string $value): string
{
    return $id . sprintf('%02d', strlen($value)) . $value;
}

/** CRC-16/CCITT-FALSE ตามที่มาตรฐาน Thai QR กำหนด ต้องคำนวณโดยรวม '6304' ที่ต่อท้าย payload ไว้แล้วด้วย */
function promptpay_crc(string $payload): string
{
    $crc = 0xFFFF;
    for ($index = 0; $index < strlen($payload); $index++) {
        $crc ^= ord($payload[$index]) << 8;
        for ($bit = 0; $bit < 8; $bit++) {
            $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
            $crc &= 0xFFFF;
        }
    }
    return strtoupper(sprintf('%04X', $crc));
}

/**
 * ปลายทางของพร้อมเพย์ใน tag 29 รองรับ 2 แบบที่แอปธนาคารอ่านได้แน่นอน
 * เบอร์โทรอยู่ sub-tag 01 และต้องเป็น 13 หลักโดยตัดศูนย์หน้าออกแล้วเติมรหัสประเทศ 0066
 * เลขบัตรประชาชนหรือเลขนิติบุคคลอยู่ sub-tag 02 และใช้ 13 หลักตามเลขจริง
 * ไม่รองรับปลายทางแบบเลขบัญชีธนาคาร เพราะทดสอบกับแอป SCB แล้วขึ้นว่าอ่าน QR ไม่ได้
 */
function promptpay_proxy_field(string $proxyType, string $proxyValue): ?string
{
    $digits = preg_replace('/\D/', '', $proxyValue) ?? '';
    if (!$digits) return null;

    if ($proxyType === 'msisdn') {
        $local = str_starts_with($digits, '66') ? substr($digits, 2) : ltrim($digits, '0');
        return strlen($local) === 9 ? promptpay_field('01', '0066' . $local) : null;
    }

    if ($proxyType === 'natid') {
        return strlen($digits) === 13 ? promptpay_field('02', $digits) : null;
    }

    return null;
}

/** payload ของ QR พร้อมเพย์แบบระบุยอดเงิน คืน null เมื่อปลายทางที่ตั้งไว้ไม่ถูกรูปแบบ เพื่อไม่ให้แสดง QR ที่สแกนไม่ได้ */
function promptpay_payload(string $proxyType, string $proxyValue, float $amount): ?string
{
    $proxy = promptpay_proxy_field($proxyType, $proxyValue);
    if (!$proxy) return null;

    // '01' = '12' คือ QR ที่ใช้จ่ายได้ครั้งเดียวเพราะระบุยอดมาแล้ว ถ้าเป็น '11' คือ QR ที่ใช้ซ้ำได้และลูกค้าต้องพิมพ์ยอดเอง
    $payload = promptpay_field('00', '01')
        . promptpay_field('01', '12')
        . promptpay_field('29', promptpay_field('00', 'A000000677010111') . $proxy)
        . promptpay_field('53', '764')
        . promptpay_field('54', number_format($amount, 2, '.', ''))
        . promptpay_field('58', 'TH')
        . '6304';

    return $payload . promptpay_crc($payload);
}
