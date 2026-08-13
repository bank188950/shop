#!/bin/bash
# สร้างชุดสำหรับอัพขึ้น shared hosting ที่ล็อกให้เขียนได้แค่ public_html
# ปรับ path ในสำเนา (ไม่แตะ repo) ให้ทุกอย่างอยู่ใน public_html แล้วกัน .env/src/storage ด้วย .htaccess
# ใช้งาน: bash scripts/build-deploy.sh   ->   ได้ผลลัพธ์ที่ deploy/public_html/
set -e

# หา root ของ repo จากตำแหน่งไฟล์ script (scripts/ อยู่ใต้ root)
SRC="$(cd "$(dirname "$0")/.." && pwd)"
STG="$SRC/deploy"
PUB="$STG/public_html"

echo "==> build frontend"
(cd "$SRC/frontend" && npm run build)

echo "==> ประกอบชุด deploy"
rm -rf "$STG"
mkdir -p "$PUB"

# 1) frontend (dist) -> public_html/
cp -R "$SRC/frontend/dist/." "$PUB/"

# 2) backend api -> public_html/api  (แก้ dirname(__DIR__, 2) -> 1 เพราะ ROOT ขยับมาเป็น public_html)
cp -R "$SRC/backend/public/api" "$PUB/api"
sed -i '' 's/dirname(__DIR__, 2)/dirname(__DIR__, 1)/g' "$PUB/api/index.php"

# 3) backend uploads -> public_html/uploads (เปิดสาธารณะได้)
cp -R "$SRC/backend/public/uploads" "$PUB/uploads"

# 4) backend src -> public_html/src (แก้ /public/uploads -> /uploads เพราะไม่มีชั้น public แล้ว)
cp -R "$SRC/backend/src" "$PUB/src"
find "$PUB/src" -name '*upload.php' -exec sed -i '' "s#/public/uploads#/uploads#g" {} +

# 5) backend storage -> public_html/storage (สลิป — ต้องกันไม่ให้เปิดผ่านเว็บ)
cp -R "$SRC/backend/storage" "$PUB/storage"

# 6) .env placeholder (แก้ค่า DB จริงหลังอัพ)
cat > "$PUB/.env" <<'ENV'
APP_ENV=production
APP_URL=https://loluean.com
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=CHANGE_ME_db
DB_USERNAME=CHANGE_ME_user
DB_PASSWORD=CHANGE_ME_password
DB_CHARSET=utf8mb4
APP_TIMEZONE=Asia/Bangkok
SLIP2GO_BASE_URL=https://connect.slip2go.com
SLIP2GO_API_KEY=
ENV

# 7) .htaccess หลัก (SPA + ปิด directory listing + กันไฟล์ที่ขึ้นต้นด้วยจุด เช่น .env)
cat > "$PUB/.htaccess" <<'HT'
Options -Indexes

# กันไม่ให้เปิดไฟล์ .env และไฟล์ที่ขึ้นต้นด้วยจุดผ่านเว็บ
<FilesMatch "^\.">
    <IfModule mod_authz_core.c>
        Require all denied
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Deny from all
    </IfModule>
</FilesMatch>

RewriteEngine On
# ให้ PHP API ทำงานตามไฟล์จริงของมัน
RewriteRule ^api/ - [L]
# ให้ React Router จัดการทุกหน้า
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
HT

# 8) deny-all .htaccess ใน src/ และ storage/ (โค้ด PHP กับสลิปห้ามเปิดผ่านเว็บ)
DENY='<IfModule mod_authz_core.c>
    Require all denied
</IfModule>
<IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
</IfModule>'
printf '%s\n' "$DENY" > "$PUB/src/.htaccess"
printf '%s\n' "$DENY" > "$PUB/storage/.htaccess"

# ล้าง .DS_Store
find "$STG" -name '.DS_Store' -delete

echo "DONE -> $STG"
