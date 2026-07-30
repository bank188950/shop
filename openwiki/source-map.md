---
type: Source Map
title: แผนผังซอร์สโค้ดสำหรับวิศวกร
description: แผนที่นำทางสำหรับ entrypoint, API ตามบทบาท, workflow คำสั่งซื้อ, schema และเอกสารออกแบบใน repository
resource: AGENTS.md
tags: [source-map, navigation, frontend, backend, database]
---

# แผนผังซอร์สโค้ดสำหรับวิศวกร

ใช้หน้านี้ค้นหาจุดเริ่มของ patch ตามแนวดิ่ง **router → page/feature → API client → PHP route/repository → schema**. Flow นี้เชื่อมข้อมูลจริงแล้วสำหรับ domain หลัก; [สถาปัตยกรรม](architecture/overview.md) อธิบายการเรียกใช้ในรันไทม์.

## รากของ repository

| ส่วน | ไฟล์สำคัญ | จุดประสงค์ |
| --- | --- | --- |
| แนวทางผู้ร่วมพัฒนา | `AGENTS.md`, `CLAUDE.md` | กติกา workspace, path เอกสารออกแบบ/schema และ build requirement |
| การติดตั้ง/deploy | `README.md` | คำสั่งเริ่ม React/PHP และ Apache shared hosting |
| เอกสารออกแบบ | `specs/design-user.md`, `specs/design-admin.md` | อ้างอิง UI และพฤติกรรมตามบทบาท |
| schema | `specs/database/schema.sql` | แหล่งโครงสร้าง MySQL canonical; ไม่มี migration directory |
| frontend entry | `frontend/src/main.tsx`, `frontend/src/app/router.tsx` | React Query, router, user/admin route และ admin guard |
| backend entry | `backend/public/api/index.php`, `backend/src/shared/` | PHP front controller, HTTP helper และ PDO |

## จุดเริ่มตามฟีเจอร์

| เรื่อง | เริ่มที่ frontend | API/backend | แนวคิดที่เกี่ยวข้อง |
| --- | --- | --- | --- |
| user auth/profile | `features/user/auth/`, `features/user/profile/` | `api/user/{auth,profile}.ts`, `backend/src/user/{auth,profile}/` | [สถาปัตยกรรม session](architecture/overview.md#การกำหนดเส้นทางคำขอและการยืนยันตัวตน) |
| catalog และตะกร้า | `features/user/home/`, `stores/cart-store.ts` | `api/user/products.ts`, `backend/src/user/products/routes.php` | [โมเดลสินค้า](domain-model.md#เอนทิตีหลัก) |
| checkout และประวัติ order | `pages/user/OrderSummaryPage.tsx`, `features/user/order/` | `api/user/orders.ts`, `backend/src/user/orders/` | [workflow ผู้ใช้](workflows/orders-and-fulfillment.md#ขั้นตอนการสั่งซื้อและชำระเงินของผู้ใช้) |
| admin auth/dashboard | `features/admin/auth/`, `features/admin/dashboard/` | `api/admin/{auth,dashboard}.ts`, `backend/src/admin/{auth,dashboard}/` | [สถาปัตยกรรม frontend](architecture/overview.md#องค์ประกอบของ-frontend) |
| admin orders/preparation | `pages/admin/OrderPage.tsx`, `features/admin/preparation/` | `api/admin/{orders,preparations}.ts`, `backend/src/admin/{orders,preparations}/` | [workflow ผู้ดูแล](workflows/orders-and-fulfillment.md#วงจรการจัดการคำสั่งซื้อฝั่งผู้ดูแล) |
| catalog/settings/banners | `features/admin/{product,category,unit,location,banner,settings}/` | `api/admin/`, `backend/src/admin/` ตามชื่อ feature | [เอนทิตีหลัก](domain-model.md#เอนทิตีหลัก) |
| user messages | `pages/{admin/AdminUserChatPage,user/MyChatsPage}.tsx` | `api/admin/user-messages.ts`, `api/user/messages.ts`, route messages | ข้อความทางเดียวจาก admin ถึง user |

## จุดที่ต้องระวังเมื่อแก้ไข

- อย่าอ้าง `database/schema.sql`, `design-user.md`, `design-admin.md`, `frontend/src/libs/api.ts`, `features/customer/` หรือ `pages/customer/`: path ปัจจุบันย้ายเป็น `specs/`, `frontend/src/lib/axios.ts`, `features/user/` และ `pages/user/`
- `backend/public/api/index.php` เป็น registry ของ route module; เพิ่ม endpoint ต้อง include module และพิจารณา admin session gate
- การแก้ order ต้องตรวจพร้อมกันทั้ง `frontend/src/api`, hook/page, `backend/src/user/orders` หรือ `backend/src/admin/orders`, และ `specs/database/schema.sql`; [workflow](workflows/orders-and-fulfillment.md) ระบุ status guard ที่ห้ามทำหลุด
- `AdminLayout.tsx` เรียก settings ก่อน badge count เพื่อไม่ยิง poll เมื่อปิด notification; อย่าย้าย logic นี้ไปซ่อนเฉพาะ UI
