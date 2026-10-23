FROM php:8.2-cli

RUN docker-php-ext-install pdo_mysql

# ค่าเริ่มต้นของ PHP (2M/8M) เล็กเกินไปสำหรับอัปโหลดรูปสินค้าและสลิป
RUN printf "upload_max_filesize=10M\npost_max_size=12M\n" > /usr/local/etc/php/conf.d/uploads.ini
