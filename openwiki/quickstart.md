---
type: Project Guide
title: โค้ดวิกิ ลูกชิ้นทอดล้อเลื่อน
description: จุดเริ่มต้นสำหรับ React/Vite storefront, PHP API, MySQL schema, การสั่งซื้อ การจัดเตรียมสินค้า และระบบผู้ดูแลของลูกชิ้นทอดล้อเลื่อน
tags: [shop, frontend, backend, mysql, openwiki]
---

# โค้ดวิกิ ลูกชิ้นทอดล้อเลื่อน

repository นี้เป็นเว็บสั่งซื้อภาษาไทยและระบบหลังบ้านสำหรับ **ลูกชิ้นทอดล้อเลื่อน** ประกอบด้วย React/Vite SPA, PHP 8.2 API และ MySQL ระบบเชื่อมข้อมูลจริงผ่าน API แล้วสำหรับการยืนยันตัวตน, แคตตาล็อก, คำสั่งซื้อ, การชำระเงินแบบยืนยันโดยผู้ใช้, การเตรียมสินค้า และงานผู้ดูแล แหล่งอ้างอิงโครงสร้างฐานข้อมูลและเอกสารออกแบบอยู่ใน `specs/`.

## เริ่มต้นที่นี่

| ถ้าคุณต้องการ… | อ่าน |
| --- | --- |
| ทำความเข้าใจ SPA, API, session และ MySQL | [ภาพรวมสถาปัตยกรรม](architecture/overview.md) |
| แก้การสร้างคำสั่งซื้อ, การชำระเงิน, การเตรียมสินค้า หรือการจัดส่ง | [คำสั่งซื้อและการจัดส่ง](workflows/orders-and-fulfillment.md) |
| เปลี่ยน schema, สถานะ หรือความสัมพันธ์ข้อมูลการค้า | [โมเดล domain](domain-model.md) |
| รัน, build, deploy หรือตรวจสอบระบบ | [การดำเนินการ, การเชื่อมต่อระบบ และการทดสอบ](operations.md) |
| ค้นหาจุดเริ่มของฟีเจอร์ในโค้ด | [แผนผังซอร์สโค้ด](source-map.md) |

## การพัฒนาบนเครื่อง local

1. เริ่ม frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. คัดลอก `backend/.env.example` เป็น `backend/.env`, กำหนดค่า MySQL แล้วเริ่ม PHP:
   ```bash
   php -S localhost:8000 -t backend/public
   ```
3. เปิด `http://localhost:5173/` สำหรับผู้ใช้ หรือ `http://localhost:5173/admin` สำหรับผู้ดูแล Vite จะ proxy `/api` ไป PHP ที่พอร์ต 8000; ตรวจ entrypoint ด้วย `GET /api/health`.

`backend/public/api/index.php` dispatch API กลุ่ม `user` และ `admin`; `/admin/*` ต้องผ่าน session ผู้ดูแลก่อน ดู [สถาปัตยกรรม](architecture/overview.md#การกำหนดเส้นทางคำขอและการยืนยันตัวตน) และ [workflow คำสั่งซื้อ](workflows/orders-and-fulfillment.md#ขั้นตอนการสั่งซื้อและชำระเงินของผู้ใช้).

## ขอบเขตของผลิตภัณฑ์ในปัจจุบัน

- ผู้ใช้สมัครและเข้าสู่ระบบ, ดูสินค้าและรอบส่ง, สร้างคำสั่งซื้อ และกดยืนยันการชำระเงิน ตะกร้ายัง persist ในเบราว์เซอร์ แต่ backend สร้าง `orders`, `order_items` และ `order_payments` ใน transaction พร้อมตรวจและตัดสต็อก
- ผู้ดูแลเข้าสู่ระบบก่อนใช้ route `/admin`; จัดการแคตตาล็อก, จุดรับ, แบนเนอร์, การตั้งค่า, ผู้ใช้, ข้อความ, คำสั่งซื้อ, รอบเตรียม และการจัดส่งผ่าน API ที่คุมด้วย session
- `specs/database/schema.sql` นิยามโมเดลถาวรเดียว รวม `order_status`, `payment_status`, `order_payments` และ `preparation_groups`; [โมเดล domain](domain-model.md) เป็นบ้านหลักของรายละเอียดข้อมูล
- QR และปุ่ม `ชำระเงินแล้ว` เป็น **self-confirmation** ของผู้ใช้ ไม่พบ payment gateway, webhook, slip upload หรือ job ยกเลิกอัตโนมัติ แม้ UI จะแสดงเวลาชำระเงิน

## วินัยในการแก้ไข

- อ่าน `AGENTS.md` ก่อนแก้โค้ด: UI ผู้ใช้อ้าง `specs/design-user.md`, UI ผู้ดูแลอ้าง `specs/design-admin.md` และ schema canonical คือ `specs/database/schema.sql`; โปรเจกต์ไม่ใช้โฟลเดอร์ migration
- API client อยู่ใน `frontend/src/api/{user,admin}/`, client ร่วมคือ `frontend/src/lib/axios.ts`; route อยู่ใน `frontend/src/app/router.tsx`
- ทุกการแก้ frontend ให้รัน `npm run build` จาก `frontend/`; ยังไม่มี test script หรือ test suite ของโปรเจกต์ ดู [การดำเนินการ](operations.md#การตรวจสอบและการทดสอบ)
- ห้าม commit `backend/.env` หรือเปิดเผย credential; เก็บ `backend/src/`, `backend/.env` และ `backend/storage/` นอก web root เมื่อติดตั้งบน Apache

## งานค้าง (backlog)

- **การยืนยันการชำระเงินจริง** — `frontend/src/pages/user/OrderSummaryPage.tsx`, `backend/src/user/orders/routes.php`: มีเพียง self-confirmation; ยังไม่มี gateway, webhook, slip upload หรือ timeout job ที่ตรวจสอบได้
- **การทดสอบอัตโนมัติ** — `frontend/package.json`, `backend/`: ไม่พบ test runner หรือไฟล์ test/spec; ควรเพิ่ม integration test สำหรับ session และ transaction ของ order/payment/preparation ก่อนขยาย workflow
