-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Aug 13, 2026 at 03:49 AM
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
(1, 'admin', '$2y$10$0icKNFXegjs2FDB/Y2W5rOjJ1/56j4xyng5lzwnvcp9TH1ezVGkCO', 'Admin Store', '9eb156f326d81dbd2af7b1b7586ebd97.png', 'super_admin', '2026-07-30 22:17:35', '2026-07-27 13:36:41', '2026-07-30 15:17:35');

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

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `message`, `display_order`, `is_active`, `starts_at`, `ends_at`, `created_by`, `created_at`, `updated_at`) VALUES
(37, '111111111', 0, 1, NULL, NULL, NULL, '2026-07-30 16:21:27', '2026-07-30 16:21:27'),
(38, '2222222', 1, 1, NULL, NULL, NULL, '2026-07-30 16:21:27', '2026-07-30 16:21:27');

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
(1, 'เมนูอร่อยพร้อมเสิร์ฟทุกวัน', 'uploads/banners/hero-truck-clean-grille.png', 1, 1, NULL, NULL, NULL, '2026-07-27 14:51:28', '2026-07-29 11:17:41'),
(2, 'ของทอดและเครื่องดื่มสดชื่น', 'uploads/banners/hero-fried-snacks-drinks.png', 2, 1, NULL, NULL, NULL, '2026-07-27 14:51:28', '2026-07-29 11:17:41'),
(4, 'ข้าวกระเพรากับข้าวผัด', 'uploads/banners/d19603607239ac66f83e2b353cf445cd.png', 3, 1, NULL, NULL, NULL, '2026-07-29 10:38:53', '2026-07-29 11:17:40');

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

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `location_id`, `delivery_date`, `delivery_period`, `preparation_group_id`, `order_status`, `payment_status`, `subtotal_amount`, `total_amount`, `user_note`, `cancelled_at`, `cancelled_by`, `cancellation_reason`, `preparing_at`, `ready_at`, `delivered_at`, `status_updated_by`, `status_note`, `ordered_at`, `updated_at`) VALUES
(1, 'PO-260729-0001', 10, 3, '2026-07-29', 'afternoon', NULL, 'cancelled', 'pending', 85.00, 85.00, NULL, '2026-07-29 13:29:05', NULL, 'ไม่ได้ชำระเงินภายในเวลาที่กำหนด', NULL, NULL, NULL, NULL, NULL, '2026-07-29 03:17:26', '2026-07-29 06:33:21'),
(2, 'PO-260729-0002', 3, 2, '2026-07-29', 'morning', NULL, 'cancelled', 'pending', 60.00, 60.00, NULL, '2026-07-29 14:00:19', NULL, 'ไม่ได้ชำระเงินภายในเวลาที่กำหนด', NULL, NULL, NULL, NULL, NULL, '2026-07-29 13:38:28', '2026-07-29 07:00:19'),
(3, 'PO-260729-0003', 3, 2, '2026-07-29', 'afternoon', 4, 'delivered', 'paid', 45.00, 45.00, NULL, NULL, NULL, NULL, '2026-07-29 22:21:51', '2026-07-29 23:09:26', '2026-07-29 23:15:59', NULL, NULL, '2026-07-29 13:40:48', '2026-07-29 16:15:59'),
(4, 'PO-260729-0004', 3, 2, '2026-07-29', 'morning', NULL, 'cancelled', 'pending', 30.00, 30.00, NULL, '2026-07-29 14:00:19', NULL, 'ไม่ได้ชำระเงินภายในเวลาที่กำหนด', NULL, NULL, NULL, NULL, NULL, '2026-07-29 13:46:10', '2026-07-29 07:00:19'),
(5, 'PO-260729-0005', 3, 2, '2026-07-29', 'afternoon', 4, 'delivered', 'paid', 60.00, 60.00, NULL, NULL, NULL, NULL, '2026-07-29 22:21:51', '2026-07-29 23:09:26', '2026-07-29 23:15:59', NULL, NULL, '2026-07-29 13:50:46', '2026-07-29 16:15:59'),
(6, 'PO-260729-0006', 3, 2, '2026-07-29', 'afternoon', NULL, 'pending_payment', 'pending', 150.00, 150.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 14:39:39', '2026-07-29 07:39:39'),
(7, 'PO-260729-0007', 3, 2, '2026-07-29', 'afternoon', 5, 'delivered', 'paid', 60.00, 60.00, NULL, NULL, NULL, NULL, '2026-07-29 23:23:58', '2026-07-29 23:24:25', '2026-07-29 23:36:03', NULL, NULL, '2026-07-29 14:44:47', '2026-07-29 16:36:03'),
(8, 'PO-260729-0008', 3, 2, '2026-07-29', 'afternoon', NULL, 'pending_payment', 'pending', 135.00, 135.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 14:48:48', '2026-07-29 07:48:48'),
(9, 'PO-260729-0009', 3, 2, '2026-07-29', 'afternoon', 3, 'delivered', 'paid', 225.00, 225.00, NULL, NULL, NULL, NULL, '2026-07-29 22:08:17', '2026-07-29 22:14:38', '2026-07-29 22:16:33', NULL, NULL, '2026-07-29 14:49:34', '2026-07-29 15:16:33'),
(10, 'PO-260729-0010', 3, 2, '2026-07-29', 'afternoon', 7, 'delivered', 'paid', 30.00, 30.00, NULL, NULL, NULL, NULL, '2026-07-30 00:08:38', '2026-07-30 00:25:15', '2026-07-30 00:32:49', NULL, NULL, '2026-07-29 15:25:35', '2026-07-29 17:32:49'),
(11, 'PO-260729-0011', 3, 2, '2026-07-29', 'afternoon', NULL, 'cancelled', 'pending', 45.00, 45.00, NULL, '2026-07-29 23:23:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-29 15:26:11', '2026-07-29 16:23:01'),
(12, 'PO-260729-0012', 10, 3, '2026-07-29', 'afternoon', 8, 'delivered', 'paid', 60.00, 60.00, NULL, NULL, NULL, NULL, '2026-07-30 00:24:15', '2026-07-30 00:25:18', '2026-07-30 00:33:35', NULL, NULL, '2026-07-29 15:52:32', '2026-07-29 17:33:35'),
(13, 'PO-260729-0013', 12, 2, '2026-07-29', 'afternoon', 6, 'delivered', 'paid', 85.00, 85.00, NULL, NULL, NULL, NULL, '2026-07-29 23:30:40', '2026-07-29 23:30:44', '2026-07-29 23:36:03', NULL, NULL, '2026-07-29 16:15:49', '2026-07-29 16:36:03'),
(14, 'PO-260730-0014', 3, 2, '2026-07-30', 'morning', 9, 'delivered', 'paid', 75.00, 75.00, NULL, NULL, NULL, NULL, '2026-07-30 01:01:18', '2026-07-30 01:01:22', '2026-07-30 01:01:35', NULL, NULL, '2026-07-30 00:53:52', '2026-07-29 18:01:35'),
(15, 'PO-260730-0015', 3, 2, '2026-07-30', 'afternoon', 11, 'delivered', 'paid', 50.00, 50.00, NULL, NULL, NULL, NULL, '2026-07-30 22:37:48', '2026-07-30 22:38:40', '2026-07-30 22:42:57', NULL, NULL, '2026-07-30 01:01:59', '2026-07-30 15:42:57'),
(16, 'PO-260730-0016', 3, 2, '2026-07-30', 'afternoon', NULL, 'pending_review', 'paid', 80.00, 80.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 02:11:52', '2026-07-29 19:11:59'),
(17, 'PO-260730-0017', 3, 2, '2026-07-30', 'morning', NULL, 'pending_review', 'paid', 35.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 02:12:35', '2026-07-29 19:12:37'),
(18, 'PO-260730-0018', 3, 2, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 35.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 11:17:51', '2026-07-30 04:17:51'),
(19, 'PO-260730-0019', 3, 2, '2026-07-30', 'afternoon', NULL, 'pending_review', 'paid', 55.00, 55.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 11:19:17', '2026-07-30 04:19:38'),
(20, 'PO-260730-0020', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 35.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 13:10:21', '2026-07-30 06:10:21'),
(21, 'PO-260730-0021', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_review', 'paid', 15.00, 15.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:11:28', '2026-07-30 11:26:53'),
(22, 'PO-260730-0022', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 30.00, 30.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 16:59:46', '2026-07-30 09:59:46'),
(23, 'PO-260730-0023', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 65.00, 65.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:33:16', '2026-07-30 11:33:16'),
(24, 'PO-260730-0024', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 35.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:34:31', '2026-07-30 11:34:31'),
(25, 'PO-260730-0025', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 35.00, 35.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 18:41:42', '2026-07-30 11:41:42'),
(26, 'PO-260730-0026', 10, 3, '2026-07-30', 'afternoon', 10, 'preparing', 'paid', 45.00, 45.00, NULL, NULL, NULL, NULL, '2026-07-30 19:36:28', NULL, NULL, NULL, NULL, '2026-07-30 19:12:01', '2026-07-30 12:36:28'),
(27, 'PO-260730-0027', 10, 3, '2026-07-30', 'afternoon', NULL, 'pending_review', 'paid', 45.00, 45.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 21:01:56', '2026-07-30 14:10:17'),
(28, 'PO-260730-0028', 3, 2, '2026-07-30', 'afternoon', 11, 'delivered', 'paid', 85.00, 85.00, NULL, NULL, NULL, NULL, '2026-07-30 22:37:48', '2026-07-30 22:38:40', '2026-07-30 22:42:57', NULL, NULL, '2026-07-30 22:21:33', '2026-07-30 15:42:57'),
(29, 'PO-260730-0029', 3, 2, '2026-07-30', 'afternoon', NULL, 'pending_payment', 'pending', 145.00, 145.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-30 23:21:54', '2026-07-30 16:21:54');

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

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit_name`, `quantity`, `unit_price`, `line_total`, `created_at`) VALUES
(4, 1, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-28 20:17:26'),
(5, 1, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-28 20:17:26'),
(6, 1, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-28 20:17:26'),
(7, 2, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 06:38:28'),
(8, 2, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-29 06:38:28'),
(9, 3, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 06:40:48'),
(10, 4, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-29 06:46:10'),
(11, 4, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-29 06:46:10'),
(12, 5, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 06:50:46'),
(13, 5, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-29 06:50:46'),
(14, 6, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 4, 15.00, 60.00, '2026-07-29 07:39:39'),
(15, 6, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 6, 15.00, 90.00, '2026-07-29 07:39:39'),
(16, 7, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 07:44:47'),
(17, 7, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-29 07:44:47'),
(18, 8, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 07:48:48'),
(19, 8, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 2, 20.00, 40.00, '2026-07-29 07:48:48'),
(20, 8, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 2, 25.00, 50.00, '2026-07-29 07:48:48'),
(21, 9, 1, 'ข้าวผัดกุ้ง', 'จาน', 3, 45.00, 135.00, '2026-07-29 07:49:34'),
(22, 9, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 2, 20.00, 40.00, '2026-07-29 07:49:34'),
(23, 9, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 2, 25.00, 50.00, '2026-07-29 07:49:34'),
(24, 10, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 2, 15.00, 30.00, '2026-07-29 08:25:35'),
(25, 11, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 08:26:11'),
(26, 12, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 08:52:32'),
(27, 12, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-29 08:52:32'),
(28, 12, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-29 08:52:32'),
(29, 13, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 09:15:49'),
(30, 13, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 2, 25.00, 50.00, '2026-07-29 09:15:49'),
(31, 13, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-29 09:15:49'),
(32, 14, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 2, 15.00, 30.00, '2026-07-29 17:53:52'),
(33, 14, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 17:53:52'),
(34, 14, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-29 17:53:52'),
(35, 15, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 2, 15.00, 30.00, '2026-07-29 18:01:59'),
(36, 15, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 18:01:59'),
(37, 16, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-29 19:11:52'),
(38, 16, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-29 19:11:52'),
(39, 16, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 19:11:52'),
(40, 17, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-29 19:12:35'),
(41, 17, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-29 19:12:35'),
(42, 18, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 04:17:51'),
(43, 18, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 04:17:51'),
(44, 19, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 04:19:17'),
(45, 19, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 2, 20.00, 40.00, '2026-07-30 04:19:17'),
(46, 20, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 06:10:21'),
(47, 20, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 06:10:21'),
(48, 21, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 09:11:28'),
(49, 22, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 09:59:46'),
(50, 22, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-30 09:59:46'),
(51, 23, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-30 11:33:16'),
(52, 23, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 11:33:16'),
(53, 24, 5, 'ลูกชิ้นปลาระเบิด', 'ไม้', 1, 15.00, 15.00, '2026-07-30 11:34:31'),
(54, 24, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 11:34:31'),
(55, 25, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 11:41:42'),
(56, 25, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 11:41:42'),
(57, 26, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 12:12:01'),
(58, 26, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-30 12:12:01'),
(59, 27, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 14:01:56'),
(60, 27, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-30 14:01:56'),
(61, 28, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 1, 15.00, 15.00, '2026-07-30 15:21:33'),
(62, 28, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 1, 25.00, 25.00, '2026-07-30 15:21:33'),
(63, 28, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-30 15:21:33'),
(64, 29, 3, 'ลูกชิ้นเนื้อเอ็น', 'ไม้', 1, 20.00, 20.00, '2026-07-30 16:21:54'),
(65, 29, 2, 'ไส้กรอกอีสานย่าง', 'ไม้', 2, 15.00, 30.00, '2026-07-30 16:21:54'),
(66, 29, 4, 'น้ำเก๊กฮวยเย็น', 'แก้ว', 2, 25.00, 50.00, '2026-07-30 16:21:54'),
(67, 29, 1, 'ข้าวผัดกุ้ง', 'จาน', 1, 45.00, 45.00, '2026-07-30 16:21:54');

-- --------------------------------------------------------

--
-- Table structure for table `order_payments`
--

CREATE TABLE `order_payments` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` bigint UNSIGNED NOT NULL,
  `payment_method` enum('bank_transfer','cash','online') COLLATE utf8mb4_unicode_ci NOT NULL,
  `slip_image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_reference_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_trans_ref` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_transferred_at` datetime DEFAULT NULL,
  `slip_amount` decimal(10,2) DEFAULT NULL,
  `slip_sender_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_sender_bank` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_sender_account` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slip_receiver_account` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verify_attempts` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `payment_status` enum('pending','paid','rejected','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `amount` decimal(10,2) NOT NULL,
  `paid_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` bigint UNSIGNED DEFAULT NULL,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `order_payments`
--

INSERT INTO `order_payments` (`id`, `order_id`, `payment_method`, `slip_image_path`, `slip_reference_id`, `slip_trans_ref`, `slip_transferred_at`, `slip_amount`, `slip_sender_name`, `slip_sender_bank`, `slip_sender_account`, `slip_receiver_account`, `verify_code`, `verify_message`, `verify_attempts`, `payment_status`, `amount`, `paid_at`, `verified_at`, `verified_by`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(3, 1, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'rejected', 85.00, NULL, NULL, NULL, NULL, '2026-07-28 20:17:26', '2026-07-29 06:29:05'),
(4, 2, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'rejected', 60.00, NULL, NULL, NULL, NULL, '2026-07-29 06:38:28', '2026-07-29 07:00:19'),
(5, 3, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 45.00, '2026-07-29 13:40:53', NULL, NULL, NULL, '2026-07-29 06:40:48', '2026-07-29 11:42:21'),
(6, 4, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'rejected', 30.00, NULL, NULL, NULL, NULL, '2026-07-29 06:46:10', '2026-07-29 07:00:19'),
(7, 5, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 60.00, '2026-07-29 13:50:53', NULL, NULL, NULL, '2026-07-29 06:50:46', '2026-07-29 06:50:53'),
(8, 6, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 150.00, NULL, NULL, NULL, NULL, '2026-07-29 07:39:39', '2026-07-29 07:39:39'),
(9, 7, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 60.00, '2026-07-29 14:45:27', NULL, NULL, NULL, '2026-07-29 07:44:47', '2026-07-29 07:45:27'),
(10, 8, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 135.00, NULL, NULL, NULL, NULL, '2026-07-29 07:48:48', '2026-07-29 07:48:48'),
(11, 9, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 225.00, '2026-07-29 14:49:36', NULL, NULL, NULL, '2026-07-29 07:49:34', '2026-07-29 07:49:36'),
(12, 10, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 30.00, '2026-07-30 00:07:47', NULL, NULL, NULL, '2026-07-29 08:25:35', '2026-07-29 17:07:47'),
(13, 11, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 45.00, NULL, NULL, NULL, NULL, '2026-07-29 08:26:11', '2026-07-29 08:26:11'),
(14, 12, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 60.00, '2026-07-29 15:52:34', NULL, NULL, NULL, '2026-07-29 08:52:32', '2026-07-29 08:52:34'),
(15, 13, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 85.00, '2026-07-29 18:27:14', NULL, NULL, NULL, '2026-07-29 09:15:49', '2026-07-29 11:27:14'),
(16, 14, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 75.00, '2026-07-30 00:59:01', NULL, NULL, NULL, '2026-07-29 17:53:52', '2026-07-29 17:59:01'),
(17, 15, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 50.00, '2026-07-30 01:02:14', NULL, NULL, NULL, '2026-07-29 18:01:59', '2026-07-29 18:02:14'),
(18, 16, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 80.00, '2026-07-30 02:11:59', NULL, NULL, NULL, '2026-07-29 19:11:52', '2026-07-29 19:11:59'),
(19, 17, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 35.00, '2026-07-30 02:12:37', NULL, NULL, NULL, '2026-07-29 19:12:35', '2026-07-29 19:12:37'),
(20, 18, 'online', 'storage/slips/34fed09e5d19605e5a5523d223f430db.jpg', 'd76feab3-d3ab-49c9-95b5-6c6c98db4c8e-15278', NULL, '2026-07-30 22:25:59', 85.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200402', 'Transfer Amount Not Match.', 1, 'pending', 35.00, NULL, NULL, NULL, NULL, '2026-07-30 04:17:51', '2026-07-30 15:31:09'),
(21, 19, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'paid', 55.00, '2026-07-30 11:19:38', NULL, NULL, NULL, '2026-07-30 04:19:17', '2026-07-30 04:19:38'),
(22, 20, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 35.00, NULL, NULL, NULL, NULL, '2026-07-30 06:10:21', '2026-07-30 06:10:21'),
(39, 22, 'online', 'storage/slips/4d74ddb96ecdb7a6f92d0a8543efea1f.png', '7203fb9f-25cc-47ef-9819-8c6c6c8d5c98-15278', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '200500', 'Slip is fraud.', 3, 'pending', 30.00, NULL, NULL, NULL, NULL, '2026-07-30 11:12:50', '2026-07-30 13:41:01'),
(40, 21, 'online', NULL, '34167464-ec98-4b0f-8deb-52b2f8532d82-15278', '202607307wm5ODYAmcPnYskfh', '2026-07-30 17:00:53', 15.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200200', 'Slip is valid.', 2, 'paid', 15.00, '2026-07-30 18:26:53', NULL, NULL, NULL, '2026-07-30 11:13:26', '2026-07-30 12:50:43'),
(41, 23, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 65.00, NULL, NULL, NULL, NULL, '2026-07-30 11:33:16', '2026-07-30 11:33:16'),
(42, 24, 'online', NULL, '60ac74bd-0774-4cf4-a4bb-d191efe73bae-15278', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '200500', 'Slip is fraud.', 3, 'pending', 35.00, NULL, NULL, NULL, NULL, '2026-07-30 11:34:31', '2026-07-30 12:50:43'),
(43, 25, 'online', NULL, 'b22797bc-2cd6-4512-b19d-4a60f0e8c007-15278', NULL, '2026-07-30 17:00:53', 15.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200402', 'Transfer Amount Not Match.', 3, 'pending', 35.00, NULL, NULL, NULL, NULL, '2026-07-30 11:41:42', '2026-07-30 12:50:43'),
(44, 26, 'online', NULL, '22330794-1c21-4249-8ccf-d31b6bdf99a5-15278', '202607307X1B8ZhjbM2ZyznBv', '2026-07-30 19:13:35', 45.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200200', 'Slip is valid.', 3, 'paid', 45.00, '2026-07-30 19:16:30', NULL, NULL, NULL, '2026-07-30 12:12:01', '2026-07-30 12:50:43'),
(45, 27, 'online', 'storage/slips/eafd353a8d55ea729552c9f37ef651b8.jpg', 'f43aa625-2567-49d8-9361-6e40bd6dc52f-15278', '202607300pPrrM3q4To4iRQS0', '2026-07-30 21:02:50', 45.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200200', 'Slip is valid.', 2, 'paid', 45.00, '2026-07-30 21:10:17', NULL, NULL, NULL, '2026-07-30 14:01:56', '2026-07-30 14:10:17'),
(46, 28, 'online', 'storage/slips/28305ade11354c9a34e8219e4362728d.jpg', '64494a1c-b20e-4dc3-af04-01c2b10e6fe6-15278', '202607306yl03L4JEDByh7lRm', '2026-07-30 22:25:59', 85.00, 'นาย ภานุพงศ์ ส', 'ธนาคารไทยพาณิชย์', 'xxxx-xx971-0', 'xxx-xxx-1314', '200200', 'Slip is valid.', 2, 'paid', 85.00, '2026-07-30 22:33:45', NULL, NULL, NULL, '2026-07-30 15:21:33', '2026-07-30 15:33:45'),
(47, 29, 'online', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'pending', 145.00, NULL, NULL, NULL, NULL, '2026-07-30 16:21:54', '2026-07-30 16:21:54');

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

--
-- Dumping data for table `preparation_groups`
--

INSERT INTO `preparation_groups` (`id`, `delivery_date`, `delivery_period`, `location_id`, `group_status`, `created_by`, `ready_at`, `created_at`, `updated_at`) VALUES
(3, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-29 22:14:38', '2026-07-29 15:08:17', '2026-07-29 15:14:38'),
(4, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-29 23:09:26', '2026-07-29 15:21:51', '2026-07-29 16:09:26'),
(5, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-29 23:24:25', '2026-07-29 16:23:58', '2026-07-29 16:24:25'),
(6, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-29 23:30:44', '2026-07-29 16:30:40', '2026-07-29 16:30:44'),
(7, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-30 00:25:15', '2026-07-29 17:08:38', '2026-07-29 17:25:15'),
(8, '2026-07-29', 'afternoon', NULL, 'ready', NULL, '2026-07-30 00:25:18', '2026-07-29 17:24:15', '2026-07-29 17:25:18'),
(9, '2026-07-30', 'morning', NULL, 'ready', NULL, '2026-07-30 01:01:22', '2026-07-29 18:01:18', '2026-07-29 18:01:22'),
(10, '2026-07-30', 'afternoon', NULL, 'preparing', NULL, NULL, '2026-07-30 12:36:28', '2026-07-30 12:36:28'),
(11, '2026-07-30', 'afternoon', NULL, 'ready', NULL, '2026-07-30 22:38:40', '2026-07-30 15:37:48', '2026-07-30 15:38:40');

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
(1, 3, 3, 'ข้าวผัดกุ้ง', 'ข้าวผัดกุ้งหอมกระทะ ผัดไข่และผักรวม เสิร์ฟพร้อมแตงกวาและมะนาว สดใหม่ทุกจาน', 'uploads/products/product-shrimp-fried-rice.png', 45.00, 10, 0, 0, 5, 1, 1, '2026-07-27 14:47:22', '2026-07-30 16:21:54'),
(2, 1, 1, 'ไส้กรอกอีสานย่าง', 'ไส้กรอกอีสานสูตรโบราณ หมักข้าวจนได้ที่ รสเปรี้ยวกลมกล่อม ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมกะหล่ำ ขิงสด และพริกขี้หนู', 'uploads/products/product-isan-sausage.png', 15.00, 8, 25, 3, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-30 16:21:54'),
(3, 1, 1, 'ลูกชิ้นเนื้อเอ็น', 'ลูกชิ้นเนื้อวัวแท้ผสมเอ็นหนึบ เด้งเต็มคำ ต้มในน้ำซุปร้อน หอมเครื่องเทศ เสิร์ฟพร้อมน้ำจิ้มสูตรพิเศษ', 'uploads/products/product-beef-tendon.png', 20.00, 9, 28, 3, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-30 16:21:54'),
(4, 2, 2, 'น้ำเก๊กฮวยเย็น', 'น้ำเก๊กฮวยต้มสดใหม่ทุกวัน หวานน้อย ชื่นใจ ช่วยดับร้อน เสิร์ฟเย็นเจี๊ยบพร้อมน้ำแข็ง', 'uploads/products/product-chrysanthemum.png', 25.00, 1, 0, 0, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-30 16:21:54'),
(5, 1, 1, 'ลูกชิ้นปลาระเบิด', 'ลูกชิ้นปลาสอดไส้ กัดคำแรกระเบิดความอร่อยเต็มปาก เนื้อแน่นเด้ง ทอดกรอบนอกนุ่มใน', 'uploads/products/product-fish-balls.png', 15.00, 11, 44, 4, 5, 0, 1, '2026-07-27 14:47:22', '2026-07-30 11:34:31');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `tracks_piece_quantity` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `name`, `display_order`, `tracks_piece_quantity`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ลูกชิ้นไส้กรอกทอด', 1, 1, 1, '2026-07-27 14:47:22', '2026-07-29 11:17:23'),
(2, 'เครื่องดื่ม', 2, 0, 1, '2026-07-27 14:47:22', '2026-07-29 11:17:23'),
(3, 'อาหารจานเดียว', 3, 0, 1, '2026-07-27 14:47:22', '2026-07-29 11:20:34'),
(4, 'กล้วยทอด', 4, 0, 0, '2026-07-27 14:47:22', '2026-07-29 11:26:19');

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
  `payment_account_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_bank_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_account_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_promptpay_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_promptpay_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_slip_account_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notice_popup_message` text COLLATE utf8mb4_unicode_ci,
  `is_notice_popup_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `is_badge_notification_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `is_slip_quota_alert_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `morning_order_cutoff`, `morning_delivery_start`, `morning_delivery_end`, `afternoon_order_cutoff`, `afternoon_delivery_start`, `afternoon_delivery_end`, `payment_account_name`, `payment_bank_code`, `payment_account_number`, `payment_promptpay_type`, `payment_promptpay_id`, `payment_slip_account_type`, `notice_popup_message`, `is_notice_popup_enabled`, `is_badge_notification_enabled`, `is_slip_quota_alert_enabled`, `updated_at`) VALUES
(1, '14:00:00', '08:00:00', '11:00:00', '23:57:00', '14:00:00', '17:00:00', 'นาย ภานุพงศ์ สมบูรณ์', '002', '0870201118', 'msisdn', '0830291314', '01002', 'ร้านค้าหยุด 12 สิงหาคม - 14 สิงหาคม', 0, 1, 1, '2026-07-30 16:21:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
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
(1, 'user', 'bankkub', '0844578543', NULL, '$2y$12$lS5oWST8lMFImzTM2A6if.B/Kh8WEevgC2dT4LSBk0NkxzWBYwWrW', 1, 1, NULL, '2026-07-27 14:54:12', '2026-07-29 06:22:35'),
(3, 'user', 'bambam', '0982123442', 'bamkub2', '$2y$12$Ecp3jcKtC1O4aR7IPS2ZceNrI.Toiua9690elxiKWdSBuur8sEuvu', 2, 1, '2026-07-30 22:14:08', '2026-07-28 17:53:46', '2026-07-30 15:14:08'),
(10, 'user', 'benz', '0983232323', NULL, '$2y$12$2JbEEiwsz2tCBg1Q2Krr5u4dAClV1K.v7FDZMzwofDY/JHZfZB/L.', 3, 1, '2026-07-30 13:09:47', '2026-07-28 19:30:21', '2026-07-30 06:09:47'),
(12, 'user', 'ohm', '0821234567', 'ohmza', '$2y$12$Ke1Fl/l.e.QLZPpBk1ude.0sAl7PsqVTy6hx5q6vTocBr95npqEHa', 2, 1, '2026-07-29 16:15:13', '2026-07-29 06:35:55', '2026-07-29 09:15:13');

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

--
-- Dumping data for table `user_messages`
--

INSERT INTO `user_messages` (`id`, `recipient_user_id`, `sender_admin_id`, `body`, `image_path`, `sent_at`, `edited_at`) VALUES
(4, 3, NULL, '11111ภภภภภ', NULL, '2026-07-29 15:01:23', '2026-07-29 15:03:10'),
(5, 3, NULL, '123456789xxxxx', 'uploads/user-messages/232a21886ecf0c84cfb33a557b00bb3c.webp', '2026-07-29 15:09:44', NULL),
(6, 3, NULL, '56788', NULL, '2026-07-29 15:37:59', NULL);

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
  ADD UNIQUE KEY `uq_order_payments_trans_ref` (`slip_trans_ref`),
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
  ADD KEY `idx_product_categories_active` (`is_active`),
  ADD KEY `idx_product_categories_display_order` (`display_order`);

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
-- Indexes for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_messages_inbox` (`recipient_user_id`,`sent_at`),
  ADD KEY `idx_user_messages_sender` (`sender_admin_id`,`sent_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `product_units`
--
ALTER TABLE `product_units`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_messages`
--
ALTER TABLE `user_messages`
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
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_preparation_group` FOREIGN KEY (`preparation_group_id`) REFERENCES `preparation_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_status_updated_by` FOREIGN KEY (`status_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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

--
-- Constraints for table `user_messages`
--
ALTER TABLE `user_messages`
  ADD CONSTRAINT `fk_user_messages_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_messages_sender` FOREIGN KEY (`sender_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
