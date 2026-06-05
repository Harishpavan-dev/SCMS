-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2026 at 06:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_session_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `marked_by` bigint(20) UNSIGNED NOT NULL,
  `method` enum('qr','manual','rep') NOT NULL DEFAULT 'qr',
  `status` enum('present','absent','late','unmarked') NOT NULL DEFAULT 'present',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `year` year(4) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`id`, `name`, `year`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'HNDIT 2024 (Senior)', '2024', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31'),
(2, 'HNDIT 2025 (Junior)', '2025', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_sessions`
--

CREATE TABLE `class_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `semester_id` bigint(20) UNSIGNED NOT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `period` int(11) DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fcm_tokens`
--

CREATE TABLE `fcm_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token` text NOT NULL,
  `device_type` varchar(50) NOT NULL DEFAULT 'web',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_uploads`
--

CREATE TABLE `file_uploads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `semester_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('note','material','assignment','other') NOT NULL DEFAULT 'material',
  `title` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `user_id`, `employee_id`, `department`, `specialization`, `created_at`, `updated_at`) VALUES
(1, 222, 'LEC001', 'IT', NULL, '2026-06-04 10:37:41', '2026-06-04 10:37:41');

-- --------------------------------------------------------

--
-- Table structure for table `lecturer_subject`
--

CREATE TABLE `lecturer_subject` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_01_01_000001_create_batches_table', 1),
(5, '2024_01_01_000002_create_semesters_table', 1),
(6, '2024_01_01_000003_create_subjects_table', 1),
(7, '2024_01_01_000004_modify_users_table', 1),
(8, '2024_01_01_000005_create_students_table', 1),
(9, '2024_01_01_000006_create_lecturers_table', 1),
(10, '2024_01_01_000008_create_class_sessions_table', 1),
(11, '2024_01_01_000009_create_attendance_sessions_table', 1),
(12, '2024_01_01_000010_create_attendance_records_table', 1),
(13, '2024_01_01_000013_create_results_table', 1),
(14, '2024_01_01_000016_create_notifications_tables', 1),
(15, '2024_01_01_000017_create_file_uploads_table', 1),
(16, '2024_01_01_000018_add_pending_to_students_status', 1),
(17, '2026_05_13_053015_make_lecturer_id_nullable_in_class_sessions', 1),
(18, '2026_05_22_130000_create_lecturer_subject_table', 1),
(19, '2026_05_27_140048_simplify_attendance_schema', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sent_via_fcm` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `semester_id` bigint(20) UNSIGNED NOT NULL,
  `continuous_assessment` decimal(5,2) DEFAULT NULL,
  `final_exam` decimal(5,2) DEFAULT NULL,
  `total_marks` decimal(5,2) DEFAULT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `grade_point` decimal(3,2) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `number` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `name`, `number`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Year 1 - Semester 1', 1, '2026-06-04', '2026-12-03', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31'),
(2, 'Year 1 - Semester 2', 2, '2026-12-04', '2027-06-03', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31'),
(3, 'Year 2 - Semester 1', 3, '2027-06-04', '2027-12-03', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31'),
(4, 'Year 2 - Semester 2', 4, '2027-12-04', '2028-06-03', 1, '2026-06-04 10:21:31', '2026-06-04 10:21:31');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `nic_number` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `address` text DEFAULT NULL,
  `batch_id` bigint(20) UNSIGNED NOT NULL,
  `current_semester_id` bigint(20) UNSIGNED DEFAULT NULL,
  `qr_code_data` varchar(255) DEFAULT NULL,
  `id_card_pdf_path` varchar(500) DEFAULT NULL,
  `status` enum('pending','active','graduated','suspended','dropped') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `registration_number`, `nic_number`, `date_of_birth`, `gender`, `address`, `batch_id`, `current_semester_id`, `qr_code_data`, `id_card_pdf_path`, `status`, `created_at`, `updated_at`) VALUES
(1, 155, 'JAF/IT/2025/F/01', 'PJAFIT2025F01', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:32', '2026-04-14 06:39:32'),
(2, 156, 'JAF/IT/2025/F/02', 'PJAFIT2025F02', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:32', '2026-04-14 06:39:32'),
(3, 157, 'JAF/IT/2025/F/04', 'PJAFIT2025F04', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:32', '2026-04-14 06:39:32'),
(4, 158, 'JAF/IT/2025/F/05', 'PJAFIT2025F05', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(5, 159, 'JAF/IT/2025/F/07', 'PJAFIT2025F07', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(6, 160, 'JAF/IT/2025/F/08', 'PJAFIT2025F08', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(7, 161, 'JAF/IT/2025/F/10', 'PJAFIT2025F10', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(8, 162, 'JAF/IT/2025/F/11', 'PJAFIT2025F11', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(9, 163, 'JAF/IT/2025/F/12', 'PJAFIT2025F12', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(10, 164, 'JAF/IT/2025/F/13', 'PJAFIT2025F13', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(11, 165, 'JAF/IT/2025/F/15', 'PJAFIT2025F15', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(12, 166, 'JAF/IT/2025/F/16', 'PJAFIT2025F16', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(13, 167, 'JAF/IT/2025/F/17', 'PJAFIT2025F17', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(14, 168, 'JAF/IT/2025/F/18', 'PJAFIT2025F18', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(15, 169, 'JAF/IT/2025/F/19', 'PJAFIT2025F19', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(16, 170, 'JAF/IT/2025/F/20', 'PJAFIT2025F20', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(17, 171, 'JAF/IT/2025/F/21', 'PJAFIT2025F21', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:37', '2026-04-14 06:39:37'),
(18, 172, 'JAF/IT/2025/F/22', 'PJAFIT2025F22', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:37', '2026-04-14 06:39:37'),
(19, 173, 'JAF/IT/2025/F/23', 'PJAFIT2025F23', '2000-01-01', 'other', 'Jaffna, Sri Lanka', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:37', '2026-05-16 23:46:15'),
(20, 174, 'JAF/IT/2025/F/25', 'PJAFIT2025F25', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:37', '2026-04-14 06:39:37'),
(21, 175, 'JAF/IT/2025/F/26', 'PJAFIT2025F26', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(22, 176, 'JAF/IT/2025/F/27', 'PJAFIT2025F27', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(23, 177, 'JAF/IT/2025/F/28', 'PJAFIT2025F28', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(24, 178, 'JAF/IT/2025/F/30', 'PJAFIT2025F30', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(25, 179, 'JAF/IT/2025/F/31', 'PJAFIT2025F31', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(26, 180, 'JAF/IT/2025/F/32', 'PJAFIT2025F32', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(27, 181, 'JAF/IT/2025/F/33', 'PJAFIT2025F33', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(28, 182, 'JAF/IT/2025/F/34', 'PJAFIT2025F34', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(29, 183, 'JAF/IT/2025/F/35', 'PJAFIT2025F35', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(30, 184, 'JAF/IT/2025/F/36', 'PJAFIT2025F36', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(31, 185, 'JAF/IT/2025/F/37', 'PJAFIT2025F37', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(32, 186, 'JAF/IT/2025/F/38', 'PJAFIT2025F38', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(33, 187, 'JAF/IT/2025/F/39', 'PJAFIT2025F39', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(34, 188, 'JAF/IT/2025/F/40', 'PJAFIT2025F40', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(35, 189, 'JAF/IT/2025/F/41', 'PJAFIT2025F41', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(36, 190, 'JAF/IT/2025/F/42', 'PJAFIT2025F42', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(37, 191, 'JAF/IT/2025/F/43', 'PJAFIT2025F43', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(38, 192, 'JAF/IT/2025/F/44', 'PJAFIT2025F44', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(39, 193, 'JAF/IT/2025/F/45', 'PJAFIT2025F45', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(40, 194, 'JAF/IT/2025/F/46', 'PJAFIT2025F46', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(41, 195, 'JAF/IT/2025/F/49', 'PJAFIT2025F49', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(42, 196, 'JAF/IT/2025/F/50', 'PJAFIT2025F50', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(43, 197, 'JAF/IT/2025/F/51', 'PJAFIT2025F51', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(44, 198, 'JAF/IT/2025/F/52', 'PJAFIT2025F52', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:45', '2026-04-14 06:39:45'),
(45, 199, 'JAF/IT/2025/F/53', 'PJAFIT2025F53', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:45', '2026-04-14 06:39:45'),
(46, 200, 'JAF/IT/2025/F/54', 'PJAFIT2025F54', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:46', '2026-04-14 06:39:46'),
(47, 201, 'JAF/IT/2025/F/55', 'PJAFIT2025F55', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:46', '2026-04-14 06:39:46'),
(48, 202, 'JAF/IT/2025/F/56', 'PJAFIT2025F56', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:47', '2026-04-14 06:39:47'),
(49, 203, 'JAF/IT/2025/F/57', 'PJAFIT2025F57', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:47', '2026-04-14 06:39:47'),
(50, 204, 'JAF/IT/2025/F/58', 'PJAFIT2025F58', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:48', '2026-04-14 06:39:48'),
(51, 205, 'JAF/IT/2025/F/59', 'PJAFIT2025F59', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:48', '2026-04-14 06:39:48'),
(52, 206, 'JAF/IT/2025/F/60', 'PJAFIT2025F60', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:49', '2026-04-14 06:39:49'),
(53, 207, 'JAF/IT/2025/F/61', 'PJAFIT2025F61', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:49', '2026-04-14 06:39:49'),
(54, 208, 'JAF/IT/2025/F/62', 'PJAFIT2025F62', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:50', '2026-04-14 06:39:50'),
(55, 209, 'JAF/IT/2025/F/63', 'PJAFIT2025F63', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:50', '2026-04-14 06:39:50'),
(56, 210, 'JAF/IT/2025/F/64', 'PJAFIT2025F64', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(57, 211, 'JAF/IT/2025/F/65', 'PJAFIT2025F65', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(58, 212, 'JAF/IT/2025/F/66', 'PJAFIT2025F66', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(59, 213, 'JAF/IT/2025/F/67', 'PJAFIT2025F67', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:52', '2026-04-14 06:39:52'),
(60, 214, 'JAF/IT/2025/F/68', 'PJAFIT2025F68', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:52', '2026-04-14 06:39:52'),
(61, 215, 'JAF/IT/2025/F/69', 'PJAFIT2025F69', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:53', '2026-04-14 06:39:53'),
(62, 216, 'JAF/IT/2025/F/70', 'PJAFIT2025F70', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:53', '2026-04-14 06:39:53'),
(63, 217, 'JAF/IT/2025/F/71', 'PJAFIT2025F71', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:54', '2026-04-14 06:39:54'),
(64, 218, 'JAF/IT/2025/F/72', 'PJAFIT2025F72', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:54', '2026-04-14 06:39:54'),
(65, 219, 'JAF/IT/2025/F/73', 'PJAFIT2025F73', '2000-01-01', 'other', 'Not Provided', 2, 2, NULL, NULL, 'active', '2026-04-14 06:39:55', '2026-04-14 06:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `credit_hours` int(11) NOT NULL DEFAULT 3,
  `description` text DEFAULT NULL,
  `semester_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `code`, `name`, `credit_hours`, `description`, `semester_id`, `created_at`, `updated_at`) VALUES
(1, 'HNDIT1012', 'Visual Application Programming', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(2, 'HNDIT1022', 'Web Design', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(3, 'HNDIT1032', 'Computer and Network Systems', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(4, 'HNDIT1042', 'Information Management and Information Systems', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(5, 'HNDIT1052', 'ICT Project (Individual)', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(6, 'HNDIT1062', 'Communication Skills', 3, NULL, 1, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(7, 'HNDIT2012', 'Fundamentals of Programming', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(8, 'HNDIT2022', 'Software Development', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(9, 'HNDIT2032', 'System Analysis and Design', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(10, 'HNDIT2042', 'Data communication and Computer Networks', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(11, 'HNDIT2052', 'Principles of User Interface Design', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(12, 'HNDIT2062', 'ICT Project (Group)', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(13, 'HNDIT2072', 'Technical Writing', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(14, 'HNDIT2082', 'Human Value & Professional Ethics', 3, NULL, 2, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(15, 'HNDIT3012', 'Object Oriented Programming', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(16, 'HNDIT3022', 'Web Programming', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(17, 'HNDIT3032', 'Data Structures and Algorithms', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(18, 'HNDIT3042', 'Database Management Systems', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(19, 'HNDIT3052', 'Operating Systems', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(20, 'HNDIT3062', 'Information and Computer Security', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(21, 'HNDIT3072', 'Statistics for IT', 3, NULL, 3, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(22, 'HNDIT4012', 'Software Engineering', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(23, 'HNDIT4022', 'Software Quality Assurance', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(24, 'HNDIT4032', 'IT Project Management', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(25, 'HNDIT4042', 'Professional World', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(26, 'HNDIT4052', 'Programming Individual Project', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(27, 'HNDIT4212', 'Machine Learning', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(28, 'HNDIT4222', 'Business Analysis Practice', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(29, 'HNDIT4232', 'Enterprise Architecture', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54'),
(30, 'HNDIT4242', 'Computer Services Management', 3, NULL, 4, '2026-06-04 10:48:54', '2026-06-04 10:48:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','lecturer','student','rep','hod') NOT NULL DEFAULT 'student',
  `avatar` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `avatar`, `is_active`, `phone`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'System Admin', 'admin@atijaffna.lk', 'admin', NULL, 1, NULL, NULL, '$2y$12$ZcTX5U4cl4IQ6JEU2bp4COje73UPR7EhQsVeY0K/kD0e7h0rycOpe', NULL, '2026-04-13 05:33:51', '2026-04-13 05:33:51'),
(2, 'Department Head', 'hod@atijaffna.lk', 'hod', NULL, 1, NULL, NULL, '$2y$12$3uwbNu0ylTKxoFzvT53cb.H1.Gc.eEoV7oIBeesWzYcb6PiHOVNYa', NULL, '2026-04-13 05:33:52', '2026-04-13 05:33:52'),
(155, 'K. Abishan', 'abiabishan1234@gmail.com', 'rep', NULL, 1, NULL, NULL, '$2y$12$ZcTX5U4cl4IQ6JEU2bp4COje73UPR7EhQsVeY0K/kD0e7h0rycOpe', NULL, '2026-04-14 06:39:32', '2026-05-14 22:53:48'),
(156, 'S. Mathuranga', 'mathusutha2005@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$2rgT/cU5pt0NlQjyeYKdP.gajLKk.IvCqXBhd5VQo1ZBoP5OEOArG', NULL, '2026-04-14 06:39:32', '2026-04-14 06:39:32'),
(157, 'K. Vinus', 'kalistasvinus@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$KpxKO8CUeyqQx9ieNODoze6rog1mgyiucyz5pXbH3tD75H0Wsdtcm', NULL, '2026-04-14 06:39:32', '2026-04-14 06:39:32'),
(158, 'M. Sangavi', 'mahanayagamsangavi10@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$L/Y24nDtrfgDgqo/qCbBu.bhb4X3jntjLUA0Pr0OdK0OjV5CBnv9e', NULL, '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(159, 'V.T.F. Luxshiya', 'luxshiyathayalan02@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$L7YHMJ.a1BHoLyPr6TOT4eRHQ.ObCXDYdeeE1A0c2HXUiuWB7Te5m', NULL, '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(160, 'K. Mathiyaparanam', 'kamshanamathiyaparanam@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$6fPfcOgnU1yEUPYdfhkIAeKKNnGYOsHm9gVgtC0JTvRJQG5lVBsMa', NULL, '2026-04-14 06:39:33', '2026-04-14 06:39:33'),
(161, 'K.R.C. Stelani', 'cleshiyas@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$n6d/rJ3tLPy1rImSe9YBP.RjAFjWTwUs5oXMlSwq6WX4lzsmt3QkO', NULL, '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(162, 'S. Sanjai', 'sanjai14sanjai@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$5GHvPkqb/WGkifmT9iR2KOvN6u82ATHbZ3PzRf21tn46Lyzmn5Wn.', NULL, '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(163, 'S. Samjuktha', 'samjukktha2002@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$TnBEe1rAMeBmYdwvPHuCkeJ1SshnHOXKFOsjVuXjyttMmEiAuQz4m', NULL, '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(164, 'U. Biranavan', 'birunthan07@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$SxueqsWNUbVMTS3Ql.2DUuwz61wmFp8/G35YtjQOdKYrA3nd/RGeG', NULL, '2026-04-14 06:39:34', '2026-04-14 06:39:34'),
(165, 'R. THUVARAKA', 'thuvarakarasaraththinam@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$r1t79b9J59ZwBggRN8Piw.I4qgZX5aooeC//SPb7ljdcDkgEsXLKu', NULL, '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(166, 'J. Nilavan', 'Nilanilavu55@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$EaqCnrEEqBfuOABMLN2ZEejqPP4kooYcxynmh9120toVivUCQGXxO', NULL, '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(167, 'S. Nithurshika', 'snithurshi@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$zsYHDwOYQHaxoDAErfdUAuDJ9zJIUAFFAbGOSUn982GEwk1buqqOa', NULL, '2026-04-14 06:39:35', '2026-04-14 06:39:35'),
(168, 'R. Pralacksana', 'ravilacksi159@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$ZjaW8cDExvJ6HmmXpN02XeXutpnnTFgVbdJgqNa1.o6yGt9i0DXD2', NULL, '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(169, 'K. Sarmilan', 'Sarmilankunan@mail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$jFDPvzoBI3ed8zWrTOSc2OhnrwulteFcQlziz7J0vFZXXIl4Y.KGy', NULL, '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(170, 'P. Mithusha', 'mithuthas47@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$o4n8RBtA58V5o6CXPvzIsOuVoCIRjxrs1XPRB/5RfOCsDOFyOj7WO', NULL, '2026-04-14 06:39:36', '2026-04-14 06:39:36'),
(171, 'S.J. Sajeevan', 'stalinjesussajeevan11@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$LfAWcRJUef3bcIXr3Nz3cuTKUZlghl/oOm7CS0aDI6aw9hsO1tEn2', NULL, '2026-04-14 06:39:37', '2026-04-19 17:48:34'),
(172, 'S. Lithursiya', 'lithursiyasanthirakumar01@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$6c6Cv5tv/1EaACmG1DJy9e2S4svLbkn8iDBwLbOBUJ4EzUKDXqjKy', NULL, '2026-04-14 06:39:37', '2026-04-14 06:39:37'),
(173, 'B. Harishpavan', 'harishpavan.dev@gmail.com', 'rep', 'http://localhost:8000/storage/avatars/avatar_173_1780590629.jpeg', 1, '94764328867', NULL, '$2y$12$j0dWGFciy23vr7uCFkUVoeFtmaa3azIXtJnC/kSBWtAKMi/w2Fhii', NULL, '2026-04-14 06:39:37', '2026-06-04 11:00:29'),
(174, 'K. Davidselvanayagam', 'dselavanajagamdevid@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$ggBUyEWb.a5xCzPgld/QCuiCnJyV5ypVAQrUVYKXxFD7Mbosf3RQy', NULL, '2026-04-14 06:39:37', '2026-04-14 06:39:37'),
(175, 'P. Prabagithan', 'prabagithanp@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$uKPVj5zCWbpMwv.tQjAIVOuSMCey4q6mzyejMgKQJTwIproHAh.nO', NULL, '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(176, '1. DILIEPRASHAN', 'indiranprashan09@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$HzeijavfC8aN7QYdBiNQ2eZpe97aoaQUIor3ovg1ZTgzHq7TGBKgi', NULL, '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(177, 'S. Abiram', 'abiramsothilingam@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$ba9egxgtqNUqaC.DIBc3K.Wn8xfRca.kTPQ9aIAk6BzpwncQyiDdK', NULL, '2026-04-14 06:39:38', '2026-04-14 06:39:38'),
(178, 'Y. Abisha', 'abiabisha1495@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$TJQa99m59etgXFQqhASsweYFDf8mNq2W/fsuyjtYR4ynQHurN.are', NULL, '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(179, 'A. Puvaneswaran', 'abarnapuvaneswaran23@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$L1xa3AaMrPuqJ50z0zPJc.0GBdyK38LV9/oVmJZAA6xX.Nyffb6A.', NULL, '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(180, 'M. Mithusha', 'mithushamakesan@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$lat8bvrOpPjDM0AK2L6nc.U4iCDSanJftoSLxl0FmpvtZCtaX.8jW', NULL, '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(181, 'A. Abinesh', 'achchutharajahabinesh@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$v2xncWS7ayI2md2OnIdEBud/LR/AhDewYS/0i7iBTYkJrD8YzOjuG', NULL, '2026-04-14 06:39:39', '2026-04-14 06:39:39'),
(182, 'B. Sailakreesan', 'balachchandransailakreesan@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$N452WexMI1ZUUFW1ReJmMu05z4A5IP9GDNrv3YuvP2XBHHo2YfFi.', NULL, '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(183, 'V. Kumarasamy', 'vithushavithu332@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$DpDqH06q2GsZUv6pDeciTuQBy7KUatc3357yXOKAHS9R960GLjEs.', NULL, '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(184, 'S. Sivakumar', 'sathiyasivi@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$59izi6PyV0uVxh3nJATbeOiNu.LpznvLDOIwUXRgpDF0HXO9luR/y', NULL, '2026-04-14 06:39:40', '2026-04-14 06:39:40'),
(185, 'S. Ashvin', 'sivakumarashvin08@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$xLhMlZ2/bsB7NlXBCk9.8u794KhyzBV5QSI1tKXT5wwmvQqTXN94K', NULL, '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(186, 'M. Pamilan', 'pamilanmaran22@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$.1W.JXX7J2zrDeJ69cGTK.EKPr0xgZ1gnobT7nQ9lvJNDalFuDbSC', NULL, '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(187, 'S. Kildan', 'kildankildan@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$Jw9n90fJpzHHVyv6snUxbuKGIcxYR8S7p/4LSwahdpSOiKzlqdyFO', NULL, '2026-04-14 06:39:41', '2026-04-14 06:39:41'),
(188, 'N. Abisha', 'nadarajahabisha1@gmial.com', 'student', NULL, 1, NULL, NULL, '$2y$12$KqGSlY8Y8fNxe0rNKejkFO8HkqrAxxmkYR0LwbE0B2JEnwPtJshoa', NULL, '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(189, 'T. Sureshkumar', 'thirishalini2510@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$lgB2VYTqqV6MTDd0CLzjCOZfZGrNewmZHAub5Adomkbx.Ujc0T006', NULL, '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(190, 'J. Taransciya Mary', 'jeevarathan47@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$VV4Hlt1BugR.AYDtRBT95.qZDm3fT0mgO854LSyWbHUlUzOv4Jbj6', NULL, '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(191, 'R. Meshak', 'riththikhmeshak1728@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$/CDnTl1yZxeN1dBShD.HpeEkIH9zx11qbHaVfPS67BFBBnZzwqE1K', NULL, '2026-04-14 06:39:42', '2026-04-14 06:39:42'),
(192, 'B. Thenuja', 'thenujabaskaran@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$vFWoSnC3.OaVGa2SiXRlJOlysrQJn4BsPhaH/189J/.3qVfg9ClO.', NULL, '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(193, 'R. Mithusan', 'r.mithusan21@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$VjDEZSMhr8D0ml0.sBhJ8O5UNGmWcpjUCAcXo1LBF3VtA/HFADeBa', NULL, '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(194, 'S. Thishanthiny', 'thisanthinythisa@gmil.com', 'student', NULL, 1, NULL, NULL, '$2y$12$kAjESJDhnNiAZauV0iuf8eEVIcqnxgwF2N1WLpvKH8Vd/ioeZSpsy', NULL, '2026-04-14 06:39:43', '2026-04-14 06:39:43'),
(195, 'P. Pakeerathan', 'pannirselvampakeerathan0019@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$qEUBpXxnm6RLCveSBcBdmufuNmWFfQxWXqgVYgPkPfr2vQ10ZCAiW', NULL, '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(196, 'T. KAJARUPAN', 'tkruban001@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$J7.X6GB96y0NUaWTaZ2nJOT5F/BmUDfmb0XPpaGOfK461po/Jh/5y', NULL, '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(197, 'R. Mathushan', 'Mathushandj@icloud.com', 'student', NULL, 1, NULL, NULL, '$2y$12$MR.eWV5B59YcYGVHfaRy7.erDFXmLPS0z7C2HJAZeDiF1KsXV68bW', NULL, '2026-04-14 06:39:44', '2026-04-14 06:39:44'),
(198, 'P. Tharneethan', 'tharneethan20050726@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$RhM973yKDCATyd/abNIjYukbutXwtAiBxb91P0tJTMUziuK5kE6qO', NULL, '2026-04-14 06:39:45', '2026-04-14 06:39:45'),
(199, 'J. Jensika', 'Jeyanantharsajensika@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$v96gTpMaogH98fUTLvLmW.nCKVPKMEVQuyJUL8eeZm8BOu7P67OXa', NULL, '2026-04-14 06:39:45', '2026-04-14 06:39:45'),
(200, 'K. TINOSAN', 'tinotinosan110@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$1VABAM8jDl1nFqtmIAyGV.ps8mBrJ0YcbU1Ku4kV/psy3zwhgkZwq', NULL, '2026-04-14 06:39:46', '2026-04-14 06:39:46'),
(201, 'J. Kirushiha', 'kirushikirushiga43@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$k61NI8u5wRtw3mYZM.mTd.1qVTx3M98391b845WINLQ26gWdw4Xqa', NULL, '2026-04-14 06:39:46', '2026-04-14 06:39:46'),
(202, 'R. Ekleshiya', 'wick71364@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$Im.y/0e26iNWome0aR5CtOYoP/Or.xZ1sQ64VANM03ITx9mlYn/xG', NULL, '2026-04-14 06:39:47', '2026-04-14 06:39:47'),
(203, 'S. Y', 'suganthiyoganathan13@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$6CZD6CORKyoD/6gfI.Vdme2NCAhZGvBHgsheIK3pW2TmdtaEWj1ga', NULL, '2026-04-14 06:39:47', '2026-04-14 06:39:47'),
(204, 'G. Sambavi', 'sambavi553@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$RTT4uplzzUCHGJp8vmhvde/ccSuQttDv6zl3PvqGkp8ZxP44pQAa6', NULL, '2026-04-14 06:39:48', '2026-04-14 06:39:48'),
(205, 'S. SANTHIYA', 'santhiyals2005@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$r7n6aOF3GFOMGrT024A3r.GjOKAY3HqL25kOJ6RkXy8bxCM6.y.nC', NULL, '2026-04-14 06:39:48', '2026-04-14 06:39:48'),
(206, 'G. HAMBERAN', 'gnanasekaranhamberan123@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$SFUcBltLr.9AOn76pNY.eOwSZwFi7Cbl0qbKTWeQZN5T0EdvAQvby', NULL, '2026-04-14 06:39:49', '2026-04-14 06:39:49'),
(207, 'K. Sivanuja', 'vanusivanu2@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$1ywGc9ymPiHJv8Tv0wzARedF2dKt0ONuIk3R8Z6kULwCBoc2VTXd2', NULL, '2026-04-14 06:39:49', '2026-04-14 06:39:49'),
(208, 'V. Sarujan', 'sarujan712004@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$X9lBfyzvm/lRELyY2Z8apu12DcRgWSX3rSsmweRAcck0qCILbioXy', NULL, '2026-04-14 06:39:50', '2026-04-14 06:39:50'),
(209, 'P. Thanushan', 'thanushanthanu246@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$owt55U.qRx6CY3/isKLq4OmBam8A42Z2oiIFzTFRxyXvsk58mE.xi', NULL, '2026-04-14 06:39:50', '2026-04-14 06:39:50'),
(210, 'K. Kukatharshan', 'kukatharshan2004@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$1kE6B6Uufb4xdDkHP0doHuxW6V9fKWx48khqiwsUEqujCvOx1IRaW', NULL, '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(211, 'Y. Harsan', 'Harsanthalapathy52@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$ALZIEUAdTKTzP/g.QbS8GuxUSn0bVT91X3U/GQs/B25L9Nr9bGede', NULL, '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(212, 'V. Darshan', 'varatharasondarshan@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$sKAv02pJlO0oBryah7y9XeHu8uaO7rbMMiG3SHPp2sKituLQxW91O', NULL, '2026-04-14 06:39:51', '2026-04-14 06:39:51'),
(213, 'T. Vinojan', 'thiyagarasavinojan08@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$OmwTIurMRM07EfpQ29taieP8MkAQEzpgCvDE5oUg7Pj3.K5pBWi3e', NULL, '2026-04-14 06:39:52', '2026-04-14 06:39:52'),
(214, 'S. Sajo', 'shadowsajosj09@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$sc7SWSakcP6jSxlEeyOtIOL.qYv5FamxIcZIblEoZkD4kuIlUwNDm', NULL, '2026-04-14 06:39:52', '2026-04-14 06:39:52'),
(215, 'K. Thamilarasi', 'mithuthamilarasi5@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$mf8iHCjzJuMg48rSL9FRyucOudYtelI8UUdiEDtO9OBQdU4DsqVNy', NULL, '2026-04-14 06:39:53', '2026-04-14 06:39:53'),
(216, 'M. Mathiyalagan', 'merushamathiyalagan@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$ivOpNX8YkIP2yb.Xr6OLwOojr3agWDJP69PulmgTF.6dmHWITeUmi', NULL, '2026-04-14 06:39:53', '2026-04-14 06:39:53'),
(217, 'S. Queensika', 'squeensika@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$1bD8boP4lHXO/8D/lszs9ezNsHxe.aQvu/abnTkynR0P2jrYdtOTG', NULL, '2026-04-14 06:39:54', '2026-04-14 06:39:54'),
(218, 'N. Darshika', 'darshikanagulendran@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$kTGMbIn0PEASBIHrHDM7VeyfLPv7bPDeIEFAO32w1OgDrVjL7TysS', NULL, '2026-04-14 06:39:54', '2026-04-14 06:39:54'),
(219, 'N. Lakshika', 'lakshikal361@gmail.com', 'student', NULL, 1, NULL, NULL, '$2y$12$F5/Cce8AYAoqLIRrJYER3uyRlDsnASsUu7Ut/UKjrsTvx1NGQG7ES', NULL, '2026-04-14 06:39:55', '2026-04-14 06:39:55'),
(221, 'test', 'harishpavan09@gmail.com', 'student', NULL, 1, '0764328867', NULL, '$2y$12$2rgT/cU5pt0NlQjyeYKdP.gajLKk.IvCqXBhd5VQo1ZBoP5OEOArG', NULL, '2026-04-24 03:18:41', '2026-05-14 22:53:40'),
(222, 'john', 'john@gmail.com', 'lecturer', NULL, 1, '0754132118', NULL, '$2y$12$KhuW4AWMSB2qGjdRSc2DFOkXRKBsk8S./SSPDkxp/Q07NGzYxRUS2', NULL, '2026-05-20 20:18:27', '2026-05-20 20:18:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_records_class_session_id_student_id_unique` (`class_session_id`,`student_id`),
  ADD KEY `attendance_records_marked_by_foreign` (`marked_by`),
  ADD KEY `attendance_records_student_id_index` (`student_id`);

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `class_sessions`
--
ALTER TABLE `class_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_sessions_subject_id_foreign` (`subject_id`),
  ADD KEY `class_sessions_lecturer_id_foreign` (`lecturer_id`),
  ADD KEY `class_sessions_semester_id_foreign` (`semester_id`),
  ADD KEY `class_sessions_batch_id_foreign` (`batch_id`),
  ADD KEY `class_sessions_date_lecturer_id_index` (`date`,`lecturer_id`),
  ADD KEY `class_sessions_date_batch_id_index` (`date`,`batch_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fcm_tokens_user_id_index` (`user_id`);

--
-- Indexes for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_uploads_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `file_uploads_semester_id_foreign` (`semester_id`),
  ADD KEY `file_uploads_subject_id_type_index` (`subject_id`,`type`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lecturers_employee_id_unique` (`employee_id`),
  ADD KEY `lecturers_user_id_foreign` (`user_id`);

--
-- Indexes for table `lecturer_subject`
--
ALTER TABLE `lecturer_subject`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lecturer_subject_lecturer_id_subject_id_unique` (`lecturer_id`,`subject_id`),
  ADD KEY `lecturer_subject_subject_id_foreign` (`subject_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_is_read_index` (`user_id`,`is_read`),
  ADD KEY `notifications_type_index` (`type`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `results_student_id_subject_id_semester_id_unique` (`student_id`,`subject_id`,`semester_id`),
  ADD KEY `results_subject_id_foreign` (`subject_id`),
  ADD KEY `results_semester_id_foreign` (`semester_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_registration_number_unique` (`registration_number`),
  ADD UNIQUE KEY `students_nic_number_unique` (`nic_number`),
  ADD UNIQUE KEY `students_qr_code_data_unique` (`qr_code_data`),
  ADD KEY `students_user_id_foreign` (`user_id`),
  ADD KEY `students_batch_id_index` (`batch_id`),
  ADD KEY `students_current_semester_id_index` (`current_semester_id`),
  ADD KEY `students_status_index` (`status`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_code_unique` (`code`),
  ADD KEY `subjects_semester_id_foreign` (`semester_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `class_sessions`
--
ALTER TABLE `class_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_uploads`
--
ALTER TABLE `file_uploads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lecturers`
--
ALTER TABLE `lecturers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lecturer_subject`
--
ALTER TABLE `lecturer_subject`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_class_session_id_foreign` FOREIGN KEY (`class_session_id`) REFERENCES `class_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_marked_by_foreign` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_sessions`
--
ALTER TABLE `class_sessions`
  ADD CONSTRAINT `class_sessions_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_sessions_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_sessions_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_sessions_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fcm_tokens`
--
ALTER TABLE `fcm_tokens`
  ADD CONSTRAINT `fcm_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD CONSTRAINT `file_uploads_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `file_uploads_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `file_uploads_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD CONSTRAINT `lecturers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturer_subject`
--
ALTER TABLE `lecturer_subject`
  ADD CONSTRAINT `lecturer_subject_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lecturer_subject_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `results_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `results_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`),
  ADD CONSTRAINT `students_current_semester_id_foreign` FOREIGN KEY (`current_semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_semester_id_foreign` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
