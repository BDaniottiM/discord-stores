ALTER TABLE `orders` MODIFY COLUMN `created_at` timestamp(6) NOT NULL DEFAULT (now());