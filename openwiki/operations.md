---
type: Runbook
title: การดำเนินการ, การเชื่อมต่อระบบ และการทดสอบ
description: การตั้งค่า local, การ deploy Apache, จุดเชื่อมต่อ API/session และ checklist ตรวจระบบคำสั่งซื้อและผู้ดูแล
tags: [operations, deployment, testing, api, security, github-actions]
---

# การดำเนินการ, การเชื่อมต่อระบบ และการทดสอบ

## การรันบนเครื่อง local และการ deploy

`README.md` เป็นแหล่งคำสั่งเริ่มระบบ: รัน `npm install` และ `npm run dev` ใน `frontend/`; คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วรัน `php -S localhost:8000 -t backend/public`. Vite proxy `/api` ไปพอร์ต 8000 และ `GET /api/health` ใช้ตรวจ front controller ได้.

สำหรับ Apache shared hosting ให้ build frontend, อัปโหลด `frontend/dist/` ไป web root, วาง `backend/public/api/` ที่ `public_html/api/`, และเก็บ `backend/src/`, `backend/.env`, `backend/storage/` นอก web root. `frontend/public/.htaccess` ปล่อย `/api/` ให้ PHP และส่ง route SPA กลับ `index.html`.

แหล่งอ้างอิง schema คือ `specs/database/schema.sql` ไม่ใช่ `database/`; repository ไม่ใช้ migration directory. เมื่อติดตั้งฐานข้อมูลที่มีอยู่ การเปลี่ยน schema ต้องมีคำสั่ง `ALTER TABLE` ที่เหมาะกับข้อมูลเดิมตามแนวทางใน `AGENTS.md`.

## การตั้งค่าและจุดเชื่อมต่อระบบ

| ขอบเขต | แหล่งที่มา | พฤติกรรมปัจจุบัน |
| --- | --- | --- |
| API client | `frontend/src/lib/axios.ts`, `frontend/src/api/{user,admin}/` | Axios ใช้ `VITE_API_URL` หรือ `/api`, รับ JSON และคืน error ภาษาไทยให้หน้า UI |
| query และ refresh | `frontend/src/main.tsx` | React Query มี stale time 30 วินาที; mutation สำเร็จ invalidate badge ผู้ดูแล |
| route API | `backend/public/api/index.php` | dispatch health และ route กลุ่ม user/admin สำหรับ auth, catalog, orders, settings, messages, dashboard, order cleanup และ preparation |
| ภาพสลิปของ order | `backend/src/admin/orders/routes.php`, `repository.php` | `GET /admin/orders/:id/slip` ใช้ได้หลัง admin session เท่านั้น; server รับเฉพาะ path `storage/slips/`, ตรวจว่าไฟล์ยังอยู่จริง แล้วตอบ MIME/ขนาดไฟล์พร้อม `Cache-Control: private, no-store` โดย response order มีเพียง `hasSlip` ไม่เผย path |
| Slip2Go | `backend/src/shared/slip2go.php`, `specs/payment-slip-verification.md` | PHP เท่านั้นเรียกตรวจสลิปและข้อมูลโควตาด้วย `SLIP2GO_BASE_URL`/`SLIP2GO_API_KEY`; secret ไม่ส่งไป frontend |
| session | `backend/src/{admin,user}/auth/session.php` | cookie `HttpOnly`, `SameSite=Lax`, strict mode, regenerate ID ตอน login; admin support remember 30 วัน |
| authorization ผู้ดูแล | `backend/public/api/index.php`, `AdminAuthGuard.tsx` | PHP ปฏิเสธ `/admin/*` หากไม่มี session และ React redirect ไป `/admin/login` |
| MySQL | `backend/src/shared/database.php`, `specs/database/schema.sql` | PDO prepared statements; domain หลักอยู่ใน schema canonical |
| badge และโควตาสลิป | `AdminLayout.tsx`, `useDashboard.ts` | badge order/stock query ทุก 30 วินาทีเมื่อ setting เปิด; โควตา Slip2Go query ทุก 5 นาทีเมื่อ `isSlipQuotaAlertEnabled` เปิด และเตือนเมื่อเหลือไม่เกิน 20 สลิปหรือ 7 วัน |
| เอกสารอัตโนมัติ | `.github/workflows/openwiki-update.yml` | รัน OpenWiki แบบตั้งเวลา/manual เพื่อสร้าง PR เอกสาร |

[สถาปัตยกรรม](architecture/overview.md) อธิบาย ownership และ route boundary ส่วน [workflow](workflows/orders-and-fulfillment.md) ระบุ contract เชิงธุรกิจที่ต้องรักษาเมื่อเปลี่ยน endpoint.

## การตรวจสอบและการทดสอบ

quality gate ที่ประกาศมีเพียง:

```bash
cd frontend
npm run build
```

คำสั่งนี้รัน `tsc -b && vite build`; `frontend/package.json` ไม่มี script `test` และไม่พบ test runner ของ PHP จึงต้องตรวจ manual แบบเจาะจงเมื่อแก้ flow ธุรกิจ.

| ส่วนที่เปลี่ยน | สิ่งที่ต้องตรวจสอบ |
| --- | --- |
| session และผู้ดูแล | login/logout, เปิด `/admin` โดยไม่มี session ต้อง redirect/401, session คงอยู่ตาม remember ที่เลือก |
| แคตตาล็อกและตะกร้า | โหลดสินค้าจาก API, เพิ่ม/ลดในตะกร้า, refresh แล้วตะกร้ายังคงอยู่ก่อน checkout |
| สร้าง order | ผู้ใช้ไม่มี login/location/rอบส่งต้องถูกกัน, สินค้าไม่พอต้องได้รายการ shortage, สร้างสำเร็จต้องล้างตะกร้าและลด stock |
| ชำระเงิน | อัปโหลด JPG/PNG ไม่เกิน 5 MB, ตรวจ MIME ฝั่ง server, สถานะเปลี่ยนเป็น paid/pending review เฉพาะผล Slip2Go ที่ผ่านยอดและผู้รับ; ทดสอบกรณีสลิปซ้ำ, provider ขัดข้อง และครบ 3 attempts |
| preparation/delivery | รับเฉพาะ paid/pending review ที่วันและรอบตรงกัน, นำออกได้เฉพาะ group preparing, ready และ delivered เปลี่ยนเฉพาะสถานะที่ถูกต้อง |
| badge, quota และ settings | ปิดสวิตช์แล้วไม่ยิง request; badge refresh ทุก 30 วินาที, quota refresh ทุก 5 นาที และตรวจเกณฑ์เตือน 20 สลิป/7 วัน |
| ภาพสลิปในรายละเอียด order | สำหรับ order ที่ `hasSlip=true` ผู้ดูแลที่มี session ต้องเห็น thumbnail และเปิดภาพเต็มได้จาก `GET /admin/orders/:id/slip`; order ที่ไม่มีหรือถูกล้างไฟล์สลิปแล้วต้องไม่แสดงการ์ด, endpoint ต้องตอบ 404 และห้าม cache ภาพ |
| ล้างไฟล์สลิป | ดู count และล้างตาม `delivery_date`; ยืนยันว่า DB ล้างเฉพาะ `slip_image_path`, metadata ยังคงอยู่ และตรวจ `backend/storage/slips/` หา orphan หากการลบไฟล์ล้มเหลว |
| Apache | เข้า `/admin/...` โดยตรงได้ผ่าน SPA fallback และ `/api/health` ยังไป PHP |

ควรเพิ่ม integration test อย่างน้อยสำหรับ session, การสร้าง order พร้อม rollback, ผลตรวจสลิป/duplicate guard และ guard ของ preparation.

## หมายเหตุด้านความปลอดภัยและข้อจำกัด

- Session user/admin มีอยู่จริง แต่ cookie `secure` เปิดเฉพาะ HTTPS; deployment production ต้องใช้ HTTPS เสมอ
- User route ตรวจเจ้าของข้อมูลใน route/repository ที่เกี่ยวข้อง; เมื่อเพิ่ม resource ให้ตรวจ authorization ฝั่งเซิร์ฟเวอร์ ไม่พึ่ง route guard ฝั่ง React เพียงอย่างเดียว
- การชำระเงินใช้การตรวจสลิปแบบ synchronous ผ่าน Slip2Go ไม่ใช่ webhook; provider error หรือผลตรวจไม่ผ่านจะไม่เปลี่ยนสถานะ order ดู [workflow การชำระเงิน](workflows/orders-and-fulfillment.md#ขั้นตอนการสั่งซื้อและชำระเงินของผู้ใช้)
- รูปสลิปอยู่ใน `backend/storage/slips/` นอก web root, รับเฉพาะ JPEG/PNG ไม่เกิน 5 MB และสุ่มชื่อไฟล์; อย่าเปิด `backend/.env`, `SLIP2GO_API_KEY` หรือ credentials
- การล้างสลิป commit DB ก่อนลบไฟล์ จึงต้องมีการตรวจ orphan file เป็นงานบำรุงรักษาหาก filesystem ล้มเหลว
- API สร้าง order ใช้ transaction/stock lock แล้ว แต่การทดสอบ integration กับ MySQL จริงยังไม่ปรากฏใน repository
