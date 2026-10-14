-- ==============================================================
-- PlacementHub MySQL Database Schema
-- Compatible with MySQL 8.0+ and MariaDB 10.5+
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `placementhub` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `placementhub`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(64) PRIMARY KEY,
    `full_name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `role` VARCHAR(20) NOT NULL DEFAULT 'student',
    `admin_status` VARCHAR(30) NULL,
    `student_id` VARCHAR(30) UNIQUE NULL,
    `admin_id` VARCHAR(30) UNIQUE NULL,
    `department` VARCHAR(80) NULL,
    `section` VARCHAR(10) NULL,
    `year` VARCHAR(20) NULL,
    `phone` VARCHAR(20) NULL,
    `cgpa` FLOAT DEFAULT 0.0,
    `avatar` TEXT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `is_super_admin` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_student_id` (`student_id`),
    INDEX `idx_users_admin_id` (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(64) NOT NULL UNIQUE,
    `skills` TEXT NULL,
    `placement_status` VARCHAR(30) DEFAULT 'Not Placed',
    `applications_count` INT DEFAULT 0,
    `offers_count` INT DEFAULT 0,
    `current_offer` VARCHAR(100) DEFAULT '',
    `resume_url` VARCHAR(255) DEFAULT '',
    `tenth_marks` VARCHAR(30) DEFAULT '',
    `twelfth_marks` VARCHAR(30) DEFAULT '',
    `active_backlogs` INT DEFAULT 0,
    `bio` TEXT NULL,
    `github` VARCHAR(255) DEFAULT '',
    `linkedin` VARCHAR(255) DEFAULT '',
    `portfolio` VARCHAR(255) DEFAULT '',
    `academic_history` TEXT NULL,
    `certifications_list` TEXT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Placement Drives Table
CREATE TABLE IF NOT EXISTS `placement_drives` (
    `id` VARCHAR(64) PRIMARY KEY,
    `company` VARCHAR(120) NOT NULL,
    `role` VARCHAR(120) NOT NULL,
    `package` VARCHAR(50) NOT NULL,
    `package_value` FLOAT DEFAULT 0.0,
    `tier` VARCHAR(30) DEFAULT 'Tier 1',
    `location` VARCHAR(120) DEFAULT 'Hyderabad',
    `eligibility` VARCHAR(120) DEFAULT 'CGPA >= 7.0',
    `min_cgpa` FLOAT DEFAULT 7.0,
    `allowed_branches` TEXT NULL,
    `drive_date` VARCHAR(50) NOT NULL,
    `deadline` VARCHAR(50) NOT NULL,
    `venue` VARCHAR(120) DEFAULT 'Campus Auditorium',
    `selection_process` TEXT NULL,
    `description` TEXT NULL,
    `skills_required` TEXT NULL,
    `vacancies` VARCHAR(50) DEFAULT 'Open',
    `status` VARCHAR(30) DEFAULT 'Upcoming',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Drive Registrations
CREATE TABLE IF NOT EXISTS `drive_registrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `drive_id` VARCHAR(64) NOT NULL,
    `student_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Registered',
    `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`drive_id`) REFERENCES `placement_drives`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_drive_student` (`drive_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Job Opportunities Table
CREATE TABLE IF NOT EXISTS `job_opportunities` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(120) NOT NULL,
    `company` VARCHAR(120) NOT NULL,
    `location` VARCHAR(120) DEFAULT 'Hyderabad',
    `job_type` VARCHAR(50) DEFAULT 'Full-time',
    `salary` VARCHAR(50) NOT NULL,
    `salary_value` FLOAT DEFAULT 0.0,
    `experience` VARCHAR(50) DEFAULT 'Fresher',
    `min_cgpa` FLOAT DEFAULT 6.5,
    `allowed_branches` TEXT NULL,
    `skills_required` TEXT NULL,
    `description` TEXT NULL,
    `requirements` TEXT NULL,
    `deadline` VARCHAR(50) NOT NULL,
    `posted_date` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Job Applications
CREATE TABLE IF NOT EXISTS `job_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` VARCHAR(64) NOT NULL,
    `student_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Applied',
    `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`job_id`) REFERENCES `job_opportunities`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_job_student` (`job_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Internships Table
CREATE TABLE IF NOT EXISTS `internships` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(120) NOT NULL,
    `company` VARCHAR(120) NOT NULL,
    `location` VARCHAR(120) DEFAULT 'Remote / Hybrid',
    `duration` VARCHAR(50) DEFAULT '6 Months',
    `stipend` VARCHAR(50) DEFAULT '₹25,000 / month',
    `min_cgpa` FLOAT DEFAULT 6.5,
    `allowed_branches` TEXT NULL,
    `skills_required` TEXT NULL,
    `description` TEXT NULL,
    `requirements` TEXT NULL,
    `deadline` VARCHAR(50) NOT NULL,
    `posted_date` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Internship Applications
CREATE TABLE IF NOT EXISTS `internship_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `internship_id` VARCHAR(64) NOT NULL,
    `student_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Applied',
    `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`internship_id`) REFERENCES `internships`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_internship_student` (`internship_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Training Classes Table
CREATE TABLE IF NOT EXISTS `training_classes` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(120) NOT NULL,
    `trainer` VARCHAR(120) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Technical',
    `date_time` VARCHAR(80) NOT NULL,
    `duration` VARCHAR(50) DEFAULT '2 Hours',
    `venue` VARCHAR(120) DEFAULT 'Seminar Hall 1',
    `meeting_link` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) DEFAULT 'Upcoming',
    `total_registered` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Attendance Records Table
CREATE TABLE IF NOT EXISTS `attendance_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` VARCHAR(64) NOT NULL UNIQUE,
    `aptitude` INT DEFAULT 85,
    `technical` INT DEFAULT 85,
    `softskills` INT DEFAULT 85,
    `mock` INT DEFAULT 85,
    `overall` INT DEFAULT 85,
    `status` VARCHAR(40) DEFAULT 'Eligible',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Certifications Table
CREATE TABLE IF NOT EXISTS `certifications` (
    `id` VARCHAR(64) PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `provider` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Cloud Computing',
    `description` TEXT NULL,
    `voucher_code` VARCHAR(50) DEFAULT 'MLRIT-FREE-2026',
    `discount` VARCHAR(50) DEFAULT '100% Free Voucher',
    `deadline` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Open',
    `enrolled_count` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Student Certifications
CREATE TABLE IF NOT EXISTS `student_certifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cert_id` VARCHAR(64) NOT NULL,
    `student_id` VARCHAR(64) NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Registered',
    `enrolled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cert_id`) REFERENCES `certifications`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_cert_student` (`cert_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Assessment Exams Table
CREATE TABLE IF NOT EXISTS `assessment_exams` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(120) NOT NULL,
    `category` VARCHAR(50) DEFAULT 'Aptitude',
    `date_time` VARCHAR(80) NOT NULL,
    `duration` VARCHAR(50) DEFAULT '60 Mins',
    `total_marks` INT DEFAULT 100,
    `passing_marks` INT DEFAULT 60,
    `exam_link` VARCHAR(255) DEFAULT 'https://assessment.mlrit.ac.in',
    `status` VARCHAR(30) DEFAULT 'Upcoming'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Student Exam Results
CREATE TABLE IF NOT EXISTS `student_exam_results` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` VARCHAR(64) NOT NULL,
    `student_id` VARCHAR(64) NOT NULL,
    `score` INT NULL,
    `rank` INT NULL,
    `status` VARCHAR(30) DEFAULT 'Completed',
    `attempted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `assessment_exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` VARCHAR(64) PRIMARY KEY,
    `student_id` VARCHAR(64) NOT NULL,
    `student_name` VARCHAR(120) NOT NULL,
    `company` VARCHAR(120) NOT NULL,
    `role` VARCHAR(120) NOT NULL,
    `rating` INT DEFAULT 5,
    `interview_experience` TEXT NOT NULL,
    `difficulty` VARCHAR(30) DEFAULT 'Medium',
    `tips` TEXT NULL,
    `rounds_count` INT DEFAULT 3,
    `created_at` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Student Queries Table
CREATE TABLE IF NOT EXISTS `student_queries` (
    `id` VARCHAR(64) PRIMARY KEY,
    `student_id` VARCHAR(64) NOT NULL,
    `student_name` VARCHAR(120) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `category` VARCHAR(80) DEFAULT 'Eligibility',
    `message` TEXT NOT NULL,
    `status` VARCHAR(30) DEFAULT 'Pending',
    `admin_response` TEXT NULL,
    `resolved_by` VARCHAR(120) NULL,
    `resolved_at` VARCHAR(50) NULL,
    `created_at` VARCHAR(50) NOT NULL,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Announcements Table
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` VARCHAR(64) PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(80) DEFAULT 'Placement Guideline',
    `priority` VARCHAR(30) DEFAULT 'High',
    `badge_color` VARCHAR(30) DEFAULT 'danger',
    `author` VARCHAR(120) DEFAULT 'Placement Cell Office',
    `date` VARCHAR(50) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(64) NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `notif_type` VARCHAR(30) DEFAULT 'info',
    `time` VARCHAR(50) DEFAULT 'Just now',
    `read` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Verification Tokens Table
CREATE TABLE IF NOT EXISTS `verification_tokens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(120) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_verif_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Admin Access Sessions Table
CREATE TABLE IF NOT EXISTS `admin_access_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `token` VARCHAR(120) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `used` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Admin Invitations Table
CREATE TABLE IF NOT EXISTS `admin_invitations` (
    `id` VARCHAR(64) PRIMARY KEY,
    `email` VARCHAR(120) NOT NULL,
    `token` VARCHAR(120) NOT NULL UNIQUE,
    `code` VARCHAR(20) NOT NULL,
    `invited_by` VARCHAR(120) DEFAULT 'Super Admin',
    `expires_at` DATETIME NOT NULL,
    `used` BOOLEAN DEFAULT FALSE,
    `used_by` VARCHAR(64) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
