---
type: Business Workflow
title: workflow คำสั่งซื้อและการจัดส่ง
description: การสร้างและยืนยันชำระคำสั่งซื้อของผู้ใช้ การตัดสต็อก และ lifecycle การเตรียมสินค้าและการจัดส่งที่บันทึกใน MySQL
tags: [workflow, orders, payment, fulfillment, admin, user]
---

# workflow คำสั่งซื้อและการจัดส่ง

หน้าจอและ API ใช้ข้อมูลเดียวกันผ่าน MySQL: ผู้ใช้สร้าง order จากตะกร้า ส่วนผู้ดูแลตรวจสอบ, จัดเข้ารอบเตรียม และส่งสินค้า [โมเดล domain](../domain-model.md) เป็นเจ้าของนิยามตารางและสถานะ; หน้านี้เป็นเจ้าของลำดับการทำงานและ guard ของแต่ละการเปลี่ยนสถานะ.

## ขั้นตอนการสั่งซื้อและชำระเงินของผู้ใช้

`OrderSummaryPage` โหลดสินค้า, การตั้งค่ารอบส่ง และ session ผู้ใช้ผ่าน React Query ผู้ใช้ต้องเข้าสู่ระบบ, มี `locationId`, เลือกรอบ และมีสินค้าในตะกร้าก่อนเรียก `POST /user/orders` จาก `frontend/src/api/user/orders.ts`.

```mermaid
sequenceDiagram
    participant User
    participant UI as Order Summary
    participant API as User Orders API
    participant DB as MySQL
    participant Verifier as Slip2Go
    User->>UI: ยืนยันสินค้าและรอบส่ง
    UI->>API: POST /user/orders
    API->>DB: lock สินค้าและตรวจสต็อก
    API->>DB: สร้าง order items และ payment
    API->>DB: ตัดสต็อกใน transaction
    API-->>UI: order ที่สร้างแล้ว
    UI->>UI: ล้างตะกร้าและแสดง QR
    User->>UI: แนบรูปสลิป
    UI->>API: POST /user/orders/id/pay พร้อม slip
    API->>DB: เก็บไฟล์และจองสิทธิ์ตรวจ
    API->>Verifier: ตรวจรูปและยอดเงิน
    Verifier-->>API: ผลตรวจสลิป
    API->>DB: บันทึกผลและเปลี่ยนสถานะเมื่อผ่าน
    API-->>UI: ผลการตรวจ
```

ภาพนี้แสดง flow ที่ `backend/src/user/orders/routes.php`, `payment.php` และ `repository.php` ตรวจจริง: backend ตรวจ cutoff จาก `settings`, lock สินค้าด้วย `FOR UPDATE`, คำนวณยอดจาก `sale_price` ในฐานข้อมูล, ตอบ shortage ทั้งหมดพร้อมกัน และสร้าง `orders`, `order_items`, `order_payments` ก่อน commit. หลังสร้างสำเร็จ UI ล้างตะกร้าและแสดง QR PromptPay ที่สร้างในโปรเจกต์; จากนั้นส่ง `multipart/form-data` ที่มี `slip` ไปยัง endpoint เดิม.

backend รับ JPG/PNG ไม่เกิน 5 MB, ตรวจ MIME ซ้ำและเก็บใต้ `backend/storage/slips/` ก่อนจองสิทธิ์ตรวจสูงสุด 3 ครั้งต่อ order. จากนั้นส่งรูปพร้อมเงื่อนไขยอดเงินตรงไป Slip2Go และตรวจเลขบัญชีผู้รับที่เห็นบางส่วนกับค่าใน `settings` เอง. เฉพาะ code `200000` หรือ `200200` ที่ผ่านทั้งสองด่านจึงบันทึกผลและเปลี่ยน `payment_status=paid`, `order_status=pending_review` พร้อม `paid_at`; ผลไม่ผ่านคงสถานะเดิมและบันทึกข้อมูลตรวจไว้ใน [โมเดล domain](../domain-model.md#เอนทิตีหลัก). รายละเอียด credential, ความปลอดภัย และการรับมือโควตาอยู่ใน [การดำเนินการ](../operations.md#การตั้งค่าและจุดเชื่อมต่อระบบ).

## วงจรการจัดการคำสั่งซื้อฝั่งผู้ดูแล

API admin อ่านและเปลี่ยน order ใน MySQL; route `/admin/*` ถูกคุมด้วย session ตาม [สถาปัตยกรรม](../architecture/overview.md#การกำหนดเส้นทางคำขอและการยืนยันตัวตน). ผู้ดูแลดูและกรอง order ผ่าน `/admin/orders`; bulk status กัน order ที่ยังไม่ `paid`, ส่วนหน้ารายละเอียดสามารถเปลี่ยน payment และ order status ผ่าน `POST /admin/orders/:id`.

```mermaid
stateDiagram-v2
    [*] --> pending_payment
    pending_payment --> pending_review: ตรวจสลิปผ่าน
    pending_payment --> cancelled
    pending_review --> preparing: สร้างรอบเตรียม
    preparing --> pending_review: นำออกจากรอบ
    preparing --> ready_for_delivery: ปิดรอบพร้อมส่ง
    ready_for_delivery --> delivered: ยืนยันส่งแล้ว
    cancelled --> [*]
    delivered --> [*]
```

state machine นี้สอดคล้องกับ `orders.order_status` และ guard ใน `backend/src/admin/preparations/routes.php`; admin detail/bulk route มีความสามารถแก้ status โดยตรง จึงต้องระวังไม่ข้ามกฎเชิงปฏิบัติการเมื่อขยายระบบ.

## กฎการจัดรอบเตรียมและส่งสินค้า

`GET /admin/preparations` คืน queue, batch และ delivery group ตามวัน/รอบ/จุดรับ. `POST /admin/preparations` ยอมรับเฉพาะ order ที่วันและรอบตรงตัวกรอง, `payment_status=paid`, `order_status=pending_review` และยังไม่มี `preparation_group_id`; transaction สร้าง `preparation_groups` แล้วเปลี่ยน order เป็น `preparing`.

- ลบ order จาก batch ได้เฉพาะ batch ที่ยัง `preparing`; order กลับ `pending_review` และลบ batch หากว่าง
- ปิด batch เปลี่ยนสมาชิก `preparing` เป็น `ready_for_delivery`, บันทึก `ready_at` และตั้ง group เป็น `ready`
- delivery view รวมสมาชิกกลุ่มที่ปิดแล้วตาม `location_id`; `POST /admin/preparations/delivered` เปลี่ยนเฉพาะ order ที่ `ready_for_delivery` เป็น `delivered` พร้อม `delivered_at`
- group เตรียมหนึ่งกลุ่มไม่ผูกจุดรับ เพราะ repository สร้างโดยไม่มี `location_id`; การส่งจึงค่อยรวมตามจุดรับในภายหลัง

## การล้างไฟล์สลิปของผู้ดูแล

`GET` และ `POST /admin/order-cleanup` ใช้ช่วงวัน, เดือน หรือปีของ `orders.delivery_date` เพื่อดูจำนวนและล้างเฉพาะ `order_payments.slip_image_path` ที่ยังมีค่า. การล้างทำ transaction เพื่อตั้ง path เป็น `NULL` ก่อน แล้วจึงลบไฟล์ด้วยกติกา path เดียวกับการอัปโหลด; metadata การตรวจ เช่น `slip_trans_ref`, ยอด, เวลาโอน และ `verify_code` ยังคงอยู่เพื่อ audit และกันสลิปซ้ำใน [โมเดล domain](../domain-model.md#ความสมบูรณ์ของข้อมูลและข้อจำกัด).

filesystem ไม่อยู่ใน transaction: ถ้า `unlink` หลัง commit ล้มเหลว ฐานข้อมูลจะไม่ชี้ไฟล์นั้นแล้วแต่ไฟล์อาจค้างอยู่ใน `backend/storage/slips/`. ให้ตรวจความสอดคล้องนี้ตาม runbook ใน [การดำเนินการ](../operations.md#การตรวจสอบและการทดสอบ).

เมื่อแก้ workflow ให้แก้ validation/route/repository และ UI hook พร้อมกัน แล้วทดสอบ transaction, status guard และผลการตัดสต็อกตาม checklist ใน [การดำเนินการ](../operations.md#การตรวจสอบและการทดสอบ).
