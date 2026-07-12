# ลูกชิ้นทอดล้อเลื่อน

โครงเริ่มต้นสำหรับเว็บสั่งสินค้าและระบบแอดมิน

```text
frontend/  React + Vite + Tailwind + shadcn/ui
backend/   PHP 8.2+ API + PDO
database/  MySQL schema
```

## URL ระหว่างพัฒนา

```text
http://localhost:5173/        หน้าลูกค้า
http://localhost:5173/admin   หน้าแอดมิน
http://localhost:5173/api/*   React ส่งต่อไป PHP API อัตโนมัติ
```

## เริ่ม Frontend

```bash
cd frontend
npm install
npm run dev
```

## เริ่ม PHP API

คัดลอก `backend/.env.example` เป็น `backend/.env` แล้วตั้งค่าฐานข้อมูล จากนั้น:

```bash
php -S localhost:8000 -t backend/public
```

API ตรวจสุขภาพอยู่ที่ `http://localhost:8000/api/health`

## Deploy บน Apache shared hosting

1. รัน `npm run build` ใน `frontend/`
2. อัปโหลดทุกไฟล์ใน `frontend/dist/` ไปที่ `public_html/`
3. อัปโหลด `backend/public/api/` ไปที่ `public_html/api/`
4. อัปโหลด `backend/src/` และ `backend/.env` ไว้นอก `public_html/`
5. อัปโหลด `backend/storage/` ไว้นอก `public_html/` เพื่อเก็บรูปสลิปอย่างปลอดภัย

ไฟล์ `.htaccess` ใน `frontend/public/` จะทำให้ `/admin` กลับเข้า React Router ส่วน `/api/*` จะส่งให้ PHP.
