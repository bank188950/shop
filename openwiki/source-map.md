---
type: Source Map
title: แผนผังซอร์สโค้ดสำหรับวิศวกร
description: แผนที่นำทางเชิงปฏิบัติสำหรับ entrypoint ของแอปพลิเคชัน, ฟีเจอร์เฉพาะบทบาท, โครงสร้างการเก็บข้อมูล, งานออกแบบ และระบบอัตโนมัติ
tags: [source-map, navigation, frontend, backend, database]
---

# แผนผังซอร์สโค้ดสำหรับวิศวกร

ใช้หน้านี้เพื่อค้นหาผู้รับผิดชอบในโค้ดก่อนทำ patch แบบเจาะจง โค้ดจัดระเบียบตามบทบาทและฟีเจอร์ฝั่ง frontend เป็นหลัก; [สถาปัตยกรรมรันไทม์](architecture/overview.md) อธิบายว่าส่วนต่างๆ เหล่านั้นทำงานร่วมกันอย่างไร

## รากของ repository

| ส่วน | ไฟล์สำคัญ | จุดประสงค์ |
| --- | --- | --- |
| กติกาสำหรับผู้ร่วมพัฒนา | `AGENTS.md`, `CLAUDE.md` | ข้อตกลงของ workspace; `AGENTS.md` ชี้ให้การเปลี่ยนแปลงฝั่งลูกค้า/ผู้ดูแลอ้างอิงเอกสารออกแบบของตน และกำหนดให้ build frontend |
| การติดตั้งและการ deploy | `README.md` | ขั้นตอนการเริ่ม frontend/PHP และการวางโครง hosting บน Apache |
| การออกแบบฝั่งลูกค้า | `design-user.md` | เอกสารอ้างอิงด้านภาพ/ผลิตภัณฑ์สำหรับเส้นทางลูกค้า |
| การออกแบบฝั่งผู้ดูแล | `design-admin.md` | เอกสารอ้างอิงด้านภาพ/ผลิตภัณฑ์สำหรับเส้นทางผู้ดูแล |
| รันไทม์ฝั่ง frontend | `frontend/src/main.tsx`, `frontend/src/app/router.tsx` | React root, provider, สไตล์ และโครงสร้าง route |
| รันไทม์ฝั่ง backend | `backend/public/api/index.php`, `backend/src/` | front controller ของ PHP, bootstrap, response helper และการเชื่อมต่อ PDO |
| เป้าหมายการเก็บข้อมูลถาวร | `database/schema.sql` | MySQL DDL สำหรับโมเดลการค้าหลักที่ตั้งใจไว้ |
| ระบบอัตโนมัติของเอกสาร | `.github/workflows/openwiki-update.yml` | workflow OpenWiki แบบตั้งเวลา/manual และการสร้าง PR ของเอกสาร |

## แผนผังฟีเจอร์ฝั่ง frontend

| เรื่อง | เริ่มที่ | แนวคิดที่เกี่ยวข้อง |
| --- | --- | --- |
| หน้าแรก/แคตตาล็อกฝั่งลูกค้า | `features/customer/home/`, `pages/customer/HomePage.tsx` | [ขั้นตอนการสั่งซื้อของลูกค้า](workflows/orders-and-fulfillment.md#ขั้นตอนการสั่งซื้อของลูกค้า) |
| ตะกร้า, ส่วนหัว, การชำระเงิน | `stores/cart-store.ts`, `features/customer/shared/`, `pages/customer/OrderSummaryPage.tsx` | [ขั้นตอนการสั่งซื้อของลูกค้า](workflows/orders-and-fulfillment.md#ขั้นตอนการสั่งซื้อของลูกค้า) |
| dialog ยืนยันตัวตน/ประวัติฝั่งลูกค้า | `features/customer/shared/AuthDialogs.tsx`, `pages/customer/MyOrdersPage.tsx` | [แนวคิดฝั่งลูกค้า](domain-model.md#แนวคิดฝั่งลูกค้า) |
| การนำทาง/โครงฝั่งผู้ดูแล | `layouts/AdminLayout.tsx`, `app/router.tsx` | [องค์ประกอบของ frontend](architecture/overview.md#องค์ประกอบของ-frontend) |
| แดชบอร์ด/คำสั่งซื้อ | `features/admin/dashboard/`, `features/admin/orders/order-data.ts`, `pages/admin/OrderPage.tsx`, `pages/admin/OrderDetailPage.tsx` | [วงจรการจัดการคำสั่งซื้อฝั่งผู้ดูแล](workflows/orders-and-fulfillment.md#วงจรการจัดการคำสั่งซื้อฝั่งผู้ดูแล) |
| การเตรียมสินค้า/การจัดส่ง | `features/admin/preparation/`, `pages/admin/PreparationPage.tsx`, `pages/admin/DispatchTodayPage.tsx` | [กฎการจัดชุดและการจัดส่ง](workflows/orders-and-fulfillment.md#กฎการจัดชุดและการจัดส่งที่กำหนดไว้ใน-store) |
| สินค้า/การตั้งค่า | `features/admin/product/`, `category/`, `unit/`, `location/`, `banner/`; และหน้าผู้ดูแลที่เกี่ยวข้อง | [แนวคิดที่ถูกจัดเก็บถาวร](domain-model.md#แนวคิดที่ถูกจัดเก็บถาวร) |
| ผู้ใช้/ข้อความฝั่งผู้ดูแล | `features/admin/user/`, `pages/admin/AdminUserChatPage.tsx` | [หมายเหตุด้านการเชื่อมต่อระบบและความปลอดภัย](operations.md#หมายเหตุด้านการเชื่อมต่อระบบและความปลอดภัย) |
| primitive ด้านภาพที่ใช้ร่วมกัน | `components/ui/`, `styles/index.css`, `styles/index-admin.css`, `styles/order-actions.css` | ทำตามการออกแบบตามบทบาทและแนวทาง accessibility ใน `AGENTS.md` |

## แผนผัง backend และข้อมูล

- `backend/src/bootstrap.php` เริ่มต้นการ autoload และการโหลด environment
- `backend/src/Database/Connection.php` เป็นเจ้าของค่าเริ่มต้นของ PDO; ให้ใช้ตัวนี้แทนการสร้างการเชื่อมต่อฐานข้อมูลเฉพาะกิจ
- `backend/src/Http/Response.php` เป็น helper สำหรับ response แบบ JSON ที่ `backend/public/api/index.php` ใช้งาน
- `backend/public/api/.htaccess` กำหนดเส้นทางคำขอ API ไปยัง entrypoint ของ PHP
- `database/schema.sql` เป็นเจ้าของตารางถาวรและ foreign key ปัจจุบันยังไม่มี migration framework หรือ seed data
- `frontend/src/libs/api.ts` เป็น client wrapper ที่มีอยู่แล้วซึ่งควรต่อยอดเมื่อมีการเพิ่ม endpoint จริง; อย่าทำ base URL/การจัดการ error ซ้ำในแต่ละหน้า

สำหรับฟีเจอร์แนวดิ่งใดๆ ให้ไล่ตาม **router → page → feature/store ตามบทบาท → API helper → PHP route → schema** ในปัจจุบัน การไล่ตามจะหยุดที่ store/ข้อมูล static สำหรับเส้นทางเชิงธุรกิจเกือบทุกเส้น; [ช่องว่างของโมเดล domain](domain-model.md#ความไม่ตรงกันระหว่าง-ui-กับ-schema) บันทึกเหตุผลไว้

## ส่วนที่มีการเปลี่ยนแปลงล่าสุด

ประวัติ git ล่าสุดแสดงว่าพื้นผิวฝั่งผู้ดูแลเป็น domain ที่มีการเปลี่ยนแปลงมากที่สุด:

- พฤติกรรมการเตรียมสินค้า/สถานะ/ตัวกรอง และการจัดส่ง: `PreparationBoard.tsx`, `preparation-store.ts`, `DispatchTodayPage.tsx`, `order-data.ts` และ CSS ฝั่งผู้ดูแล
- การโต้ตอบในรายละเอียดคำสั่งซื้อ: `pages/admin/OrderDetailPage.tsx` และข้อมูล order/preparation
- ข้อความตรง: `f2b2383` เพิ่ม `admin-user-messages.ts`, `AdminUserChatPage.tsx`, `/admin/users/:userId/chat` และตัวเรียกใช้ใน `UserTable.tsx`; จากนั้น `ee387d0` ปรับขนาดไอคอนข้อความ
- พฤติกรรมของฟอร์มสินค้าและ UI รีเซ็ตสต็อกก็มีการเปลี่ยนแปลงล่าสุดใน `ProductForm.tsx` และ `confirm-admin-delete.ts`

ตรวจสอบประวัติแบบเจาะจงของไฟล์ที่คุณแก้ไข โดยเฉพาะโมดูลสถานะของ workflow เพราะงานล่าสุดเป็นชุดของ patch UI เล็กๆ ต่อเนื่องกัน [หน้าการดำเนินการ](operations.md#ความคืบหน้าล่าสุดของ-repository) ให้ข้อสรุปในระดับที่สูงขึ้นจากประวัตินั้น
