---
type: Documentation Plan
title: "แผนอัปเดตเอกสารการตรวจสลิป"
description: "แผนชั่วคราวสำหรับอัปเดตเอกสารตาม workflow ตรวจสลิป Slip2Go การล้างไฟล์สลิป และการแจ้งเตือนโควตา"
tags: [openwiki, plan, payment, slip2go]
---

# แผนอัปเดตเอกสารการตรวจสลิป

## ผลกระทบจากซอร์ส

| การเปลี่ยนแปลงซอร์ส | หน้าเอกสารที่กระทบ | การแก้ไขที่ต้องทำ | เหตุผล |
| --- | --- | --- | --- |
| `backend/src/user/orders/{routes,payment,repository}.php`, `frontend/src/features/user/order/SlipUploadForm.tsx`, `specs/payment-slip-verification.md` | `workflows/orders-and-fulfillment.md`, `quickstart.md`, `operations.md`, `domain-model.md`, `architecture/overview.md` | แทนคำอธิบาย self-confirmation ด้วยการอัปโหลดและตรวจสลิปผ่าน Slip2Go | เปลี่ยน contract การรับชำระและสถานะคำสั่งซื้อจริง |
| `backend/src/admin/order-cleanup/`, `frontend/src/pages/admin/OrderCleanupPage.tsx` | `workflows/orders-and-fulfillment.md`, `operations.md`, `domain-model.md` | เพิ่ม lifecycle ล้างไฟล์ตาม `delivery_date` และ retention metadata | เป็น workflow ผู้ดูแลใหม่และมีจุดเสี่ยง DB/file consistency |
| `backend/src/shared/slip2go.php`, `backend/src/admin/dashboard/routes.php`, `frontend/src/layouts/AdminLayout.tsx` | `operations.md`, `architecture/overview.md`, `quickstart.md` | เพิ่ม boundary ของ secret, endpoint โควตา, poll และเกณฑ์เตือน | เพิ่ม external integration และการดำเนินการที่ต้องเฝ้าดู |

## ความสัมพันธ์ที่จะบันทึก

- workflow การชำระเงิน -> ใช้ Slip2Go เพื่อตรวจรูปสลิป -> operations การตั้งค่าและการเฝ้าดู
- workflow การชำระเงิน -> บันทึกผลตรวจและเปลี่ยนสถานะ -> domain model `orders` และ `order_payments`
- workflow การล้างไฟล์สลิป -> ล้างเฉพาะไฟล์และ path ตาม `delivery_date` -> domain model `order_payments`
- architecture -> เรียก Slip2Go จาก PHP ที่ถือ secret -> operations การตั้งค่าและความปลอดภัย

## ขอบเขตที่ไม่แก้

- `source-map.md` และไฟล์ index ยังไม่ผิดในระดับที่ขัดขวางการนำทาง และไม่แก้เพื่อหลีกเลี่ยง diff เกินจำเป็น
