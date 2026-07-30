<?php
declare(strict_types=1);

/**
 * แปลงช่วงเวลาที่เลือกจากหน้าล้างไฟล์สลิปเป็นวันเริ่มและวันสิ้นสุด
 * ยึด delivery_date ตามที่หน้าจอระบุว่าเป็นวันจัดส่ง ไม่ใช่เวลาที่ลูกค้ากดสั่ง
 * วันและเดือนที่ส่งมาเป็นคริสต์ศักราชจาก ThaiDatePicker แต่ปีเป็นพุทธศักราชจาก dropdown จึงต้องลบ 543 เฉพาะกรณีปี
 */
function order_cleanup_range(string $period, string $value): ?array
{
    if ($period === 'day' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) return [$value, $value];

    if ($period === 'month' && preg_match('/^\d{4}-\d{2}$/', $value)) {
        $start = $value . '-01';
        return [$start, date('Y-m-t', (int) strtotime($start))];
    }

    if ($period === 'year' && preg_match('/^\d{4}$/', $value)) {
        $year = (int) $value - 543;
        if ($year < 2000 || $year > 2200) return null;
        return [sprintf('%04d-01-01', $year), sprintf('%04d-12-31', $year)];
    }

    return null;
}

/** นับเฉพาะรายการที่ยังมีไฟล์สลิปอยู่จริง ต้องใช้เงื่อนไขชุดเดียวกับตอนล้าง ไม่งั้นตัวเลขที่ยืนยันจะไม่ตรงกับที่ทำจริง */
function order_cleanup_slip_paths(PDO $db, string $start, string $end): array
{
    $statement = $db->prepare('SELECT p.order_id, p.slip_image_path
        FROM order_payments p
        INNER JOIN orders o ON o.id = p.order_id
        WHERE p.slip_image_path IS NOT NULL AND o.delivery_date BETWEEN :start AND :end
        ORDER BY p.order_id');
    $statement->execute(['start' => $start, 'end' => $end]);
    return $statement->fetchAll();
}

/**
 * ล้างเฉพาะไฟล์รูปสลิปและ path ที่ชี้ไปหาไฟล์นั้น ข้อมูลผลตรวจอื่นยังอยู่ครบ
 * ได้แก่ slip_trans_ref, ยอด, เวลาโอน, ชื่อผู้โอน และ verify_code จึงยังตรวจสอบย้อนหลังและกันสลิปซ้ำได้
 * ลบแถวในฐานข้อมูลให้สำเร็จก่อนแล้วจึงลบไฟล์ ถ้าลบไฟล์ก่อนแล้วฐานข้อมูลพัง จะเหลือ path ที่ชี้ไปหาไฟล์ที่ไม่มีอยู่
 */
function order_cleanup_clear_slips(PDO $db, array $slips): int
{
    if (!$slips) return 0;

    $orderIds = array_map(static fn (array $slip) => (int) $slip['order_id'], $slips);
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));

    $db->beginTransaction();
    try {
        $statement = $db->prepare("UPDATE order_payments SET slip_image_path = NULL WHERE order_id IN ({$placeholders})");
        $statement->execute($orderIds);
        $db->commit();
    } catch (Throwable $exception) {
        if ($db->inTransaction()) $db->rollBack();
        throw $exception;
    }

    // user_order_slip_delete อยู่ใน src/user/orders/payment.php ใช้ร่วมกันเพื่อให้กติกาการลบไฟล์ในโฟลเดอร์ storage/slips อยู่ที่เดียว
    foreach ($slips as $slip) user_order_slip_delete($slip['slip_image_path']);

    return count($slips);
}
