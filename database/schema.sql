-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Jul 28, 2026 at 05:43 PM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lorluean_shop_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` tinyint UNSIGNED NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_filename` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('super_admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'super_admin',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password_hash`, `display_name`, `avatar_filename`, `role`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$0icKNFXegjs2FDB/Y2W5rOjJ1/56j4xyng5lzwnvcp9TH1ezVGkCO', 'Admin Store', '9eb156f326d81dbd2af7b1b7586ebd97.png', 'super_admin', '2026-07-29 00:41:01', '2026-07-27 13:36:41', '2026-07-28 17:41:01');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint UNSIGNED NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `image_path`, `display_order`, `is_active`, `starts_at`, `ends_at`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'เมนูอร่อยพร้อมเสิร์ฟทุกวัน', 'uploads/banners/hero-truck-clean-grille.png', 1, 1, NULL, NULL, NULL, '2026-07-27 14:51:28', '2026-07-27 14:51:28'),
(2, 'ของทอดและเครื่องดื่มสดชื่น', 'uploads/banners/hero-fried-snacks-drinks.png', 2, 1, NULL, NULL, NULL, '2026-07-27 14:51:28', '2026-07-27 14:52:12');

-- --------------------------------------------------------

--
-- Table structure for table `user_messages`
--

CREATE TABLE `user_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `recipient_user_id` bigint UNSIGNED NOT NULL,
  `sender_admin_id` bigint UNSIGNED DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `edited_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'สถานที่ส่ง A', 1, '2026-07-27 14:52:52', '2026-07-27 14:52:52'),
(2, 'สถานที่ส่ง B', 1, '2026-07-27 14:53:00', '2026-07-27 14:53:00'),
(3, 'สถานที่ส่ง C', 1, '2026-07-27 14:53:05', '2026-07-27 14:53:05');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `location_id` bigint UNSIGNED NOT NULL,
  `delivery_date` date NOT NULL,
  `delivery_period` enum('morning','afternoon') COLLATE utf8mb4_unicode_ci NOT NULL,
  `preparation_group_id` bigint UNSIGNED DEFAULT NULL,
  `order_status` enum('pending_payment','pending_review','preparing','ready_for_delivery','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_payment',
  `payment_status` enum('pending','paid','rejected','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `subtotal_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `user_note` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_by` bigint UNSIGNED DEFAULT NULL,
  `cancellation_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preparing_at` datetime DEFAULT NULL,
  `ready_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `status_updated_by` bigint UNSIGNED DEFAULT NULL,
  `status_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `order_payments`
--

CREATE TABLE `order_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_method` enum('bank_transfer','cash','online') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('pending','paid','rejected','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` bigint UNSIGNED DEFAULT NULL,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `preparation_groups`
--

CREATE TABLE `preparation_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `delivery_date` date NOT NULL,
  `delivery_period` enum('morning','afternoon') COLLATE utf8mb4_unicode_ci NOT NULL,
  `location_id` bigint UNSIGNED DEFAULT NULL,
  `group_status` enum('preparing','ready') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'preparing',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `ready_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `unit_id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sale_price` decimal(10,2) NOT NULL,
  `stock_quantity` int UNSIGNED NOT NULL DEFAULT '0',
  `stock_piece_count` int UNSIGNED NOT NULL DEFAULT '0',
  `pieces_per_sale` int UNSIGNED NOT NULL DEFAULT '0',
  `low_stock_threshold` int UNSIGNED NOT NULL DEFAULT '5',
  `is_recommended` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `unit_id`, `name`, `description`, `image_path`, `sale_price`, `stock_quantity`, `stock_piece_count`, `pieces_per_sale`, `low_stock_threshold`, `is_recommended`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 4, 3, 'ข้าวผัดกุ้ง', 'ข้าวผัดกุ้งหอมกระทะ ผัดไข่และผักรวม เสิร์ฟพร้อมแตงกวาและมะนาว สดใหม่ทุกจาน', 'uploads/products/product-shrimp-fried-rice.png', 45.00, 12, 0, 0, 5, 1, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(2, 2, 1, 'ไส้กรอกอีสานย่าง', 'ไส้กรอกอีสานสูตรโบราณ หมักข้าวจนได้ที่ รสเปรี้ยวกลมกล่อม ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมกะหล่ำ ขิงสด และพริกขี้หนู', 'uploads/products/product-isan-sausage.png', 15.00, 25, 50, 2, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(3, 1, 1, 'ลูกชิ้นเนื้อเอ็น', 'ลูกชิ้นเนื้อวัวแท้ผสมเอ็นหนึบ เด้งเต็มคำ ต้มในน้ำซุปร้อน หอมเครื่องเทศ เสิร์ฟพร้อมน้ำจิ้มสูตรพิเศษ', 'uploads/products/product-beef-tendon.png', 20.00, 16, 48, 3, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-27 15:02:35'),
(4, 3, 2, 'น้ำเก๊กฮวยเย็น', 'น้ำเก๊กฮวยต้มสดใหม่ทุกวัน หวานน้อย ชื่นใจ ช่วยดับร้อน เสิร์ฟเย็นเจี๊ยบพร้อมน้ำแข็ง', 'uploads/products/product-chrysanthemum.png', 25.00, 5, 0, 0, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(5, 1, 1, 'ลูกชิ้นปลาระเบิด', 'ลูกชิ้นปลาสอดไส้ กัดคำแรกระเบิดความอร่อยเต็มปาก เนื้อแน่นเด้ง ทอดกรอบนอกนุ่มใน', 'uploads/products/product-fish-balls.png', 15.00, 0, 0, 3, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tracks_piece_quantity` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `name`, `tracks_piece_quantity`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ลูกชิ้น', 1, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(2, 'ไส้กรอก', 1, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(3, 'เครื่องดื่ม', 0, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22'),
(4, 'อาหารจานเดียว', 0, 1, '2026-07-27 14:47:22', '2026-07-27 14:47:22');

-- --------------------------------------------------------

--
-- Table structure for table `product_units`
--

CREATE TABLE `product_units` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_units`
--

INSERT INTO `product_units` (`id`, `name`, `is_active`, `created_at`) VALUES
(1, 'ไม้', 1, '2026-07-27 14:47:22'),
(2, 'แก้ว', 1, '2026-07-27 14:47:22'),
(3, 'จาน', 1, '2026-07-27 14:47:22');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `morning_order_cutoff` time NOT NULL DEFAULT '08:00:00',
  `morning_delivery_start` time NOT NULL DEFAULT '09:00:00',
  `morning_delivery_end` time NOT NULL DEFAULT '10:00:00',
  `afternoon_order_cutoff` time NOT NULL DEFAULT '12:00:00',
  `afternoon_delivery_start` time NOT NULL DEFAULT '14:00:00',
  `afternoon_delivery_end` time NOT NULL DEFAULT '15:00:00',
  `notice_popup_message` text COLLATE utf8mb4_unicode_ci,
  `is_notice_popup_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `morning_order_cutoff`, `morning_delivery_start`, `morning_delivery_end`, `afternoon_order_cutoff`, `afternoon_delivery_start`, `afternoon_delivery_end`, `notice_popup_message`, `is_notice_popup_enabled`, `updated_at`) VALUES
(1, '07:07:00', '09:00:00', '10:01:00', '19:10:00', '14:00:00', '15:01:00', 'ตตตต', 1, '2026-07-27 13:17:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` char(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_account` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_location_id` bigint UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role`, `full_name`, `phone`, `line_account`, `password_hash`, `default_location_id`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'user', 'bankkub', '0844578543', NULL, '$2y$12$lS5oWST8lMFImzTM2A6if.B/Kh8WEevgC2dT4LSBk0NkxzWBYwWrW', 1, 1, NULL, '2026-07-27 14:54:12', '2026-07-27 14:54:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admin_username` (`username`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_announcements_visible` (`is_active`,`display_order`,`starts_at`,`ends_at`),
  ADD KEY `fk_announcements_created_by` (`created_by`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_banners_visible` (`is_active`,`display_order`,`starts_at`,`ends_at`),
  ADD KEY `fk_banners_created_by` (`created_by`);

--
-- Indexes for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_messages_inbox` (`recipient_user_id`,`sent_at`),
  ADD KEY `idx_user_messages_sender` (`sender_admin_id`,`sent_at`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_locations_name` (`name`),
  ADD KEY `idx_locations_active` (`is_active`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_orders_order_number` (`order_number`),
  ADD KEY `idx_orders_dashboard` (`delivery_date`,`delivery_period`,`payment_status`,`order_status`),
  ADD KEY `idx_orders_user_created` (`user_id`,`ordered_at`),
  ADD KEY `idx_orders_location_date` (`location_id`,`delivery_date`),
  ADD KEY `idx_orders_preparation_group` (`preparation_group_id`),
  ADD KEY `fk_orders_cancelled_by` (`cancelled_by`),
  ADD KEY `fk_orders_status_updated_by` (`status_updated_by`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`);

--
-- Indexes for table `order_payments`
--
ALTER TABLE `order_payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_order_payments_order` (`order_id`),
  ADD KEY `idx_order_payments_status` (`payment_status`,`created_at`),
  ADD KEY `fk_order_payments_verified_by` (`verified_by`);

--
-- Indexes for table `preparation_groups`
--
ALTER TABLE `preparation_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_preparation_groups_schedule` (`delivery_date`,`delivery_period`,`group_status`),
  ADD KEY `idx_preparation_groups_location` (`location_id`),
  ADD KEY `fk_preparation_groups_created_by` (`created_by`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category_active` (`category_id`,`is_active`),
  ADD KEY `fk_products_unit` (`unit_id`),
  ADD KEY `idx_products_low_stock` (`is_active`,`stock_quantity`),
  ADD KEY `idx_products_recommended` (`is_active`,`is_recommended`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_categories_name` (`name`),
  ADD KEY `idx_product_categories_active` (`is_active`);

--
-- Indexes for table `product_units`
--
ALTER TABLE `product_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_units_name` (`name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_phone` (`phone`),
  ADD KEY `idx_users_role_active` (`role`,`is_active`),
  ADD KEY `fk_users_default_location` (`default_location_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_messages`
--
ALTER TABLE `user_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_payments`
--
ALTER TABLE `order_payments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `preparation_groups`
--
ALTER TABLE `preparation_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_units`
--
ALTER TABLE `product_units`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `banners`
--
ALTER TABLE `banners`
  ADD CONSTRAINT `fk_banners_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD CONSTRAINT `fk_user_messages_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_messages_sender` FOREIGN KEY (`sender_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_preparation_group` FOREIGN KEY (`preparation_group_id`) REFERENCES `preparation_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_status_updated_by` FOREIGN KEY (`status_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_payments`
--
ALTER TABLE `order_payments`
  ADD CONSTRAINT `fk_order_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_payments_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `preparation_groups`
--
ALTER TABLE `preparation_groups`
  ADD CONSTRAINT `fk_preparation_groups_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_preparation_groups_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_products_unit` FOREIGN KEY (`unit_id`) REFERENCES `product_units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_default_location` FOREIGN KEY (`default_location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
