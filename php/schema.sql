-- =============================================================================
-- Tigint Scents MySQL Database Schema
-- Compatible with XAMPP MySQL / MariaDB Server
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `tigint_scents`;
USE `tigint_scents`;

-- 1. Users Table (Jumia-style account system)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default admin account requested by user
-- Default fallback credentials:
-- Username: admin@tigintscents.com
-- Password: ChangeMe2026!
INSERT INTO `admins` (`email`, `password`)
VALUES ('admin@tigintscents.com', 'ChangeMe2026!')
ON DUPLICATE KEY UPDATE `password` = 'ChangeMe2026!';

-- 3. Core Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('oil_wholesale', 'retail_spray', 'accessory') NOT NULL,
    `description` TEXT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `badge` VARCHAR(100) DEFAULT NULL,
    `is_available` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Variants (Sizes & Pricing)
CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(50) NOT NULL,
    `size_label` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(50) PRIMARY KEY,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `mpesa_phone` VARCHAR(20) NOT NULL,
    `delivery_method` VARCHAR(50) NOT NULL,
    `location_details` TEXT,
    `delivery_cost` DECIMAL(10, 2) DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payment_status` VARCHAR(50) DEFAULT 'paid',
    `mpesa_receipt` VARCHAR(100) DEFAULT NULL,
    `checkout_request_id` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Order Line Items
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `size_label` VARCHAR(50) DEFAULT 'Standard',
    `selected_scent` VARCHAR(100) DEFAULT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_each` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- Seed Catalog Products and Default Variants
-- =============================================================================

INSERT INTO `products` (`id`, `name`, `category`, `description`, `image_url`, `badge`, `is_available`) VALUES
('oil_wholesale', 'Grade 1 Oil-Based Perfume Oil (Wholesale)', 'oil_wholesale', 'Purely undiluted grade 1 fragrance oil imported directly from France & Germany. High concentration for up to 48-hour longevity. Perfect for personal luxury, custom decants, or perfume resellers.', 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600', '100% Pure Import', 1),
('mayar-30ml', 'Mayar EDP (30ml Spray)', 'retail_spray', 'A delightful fruity-floral fragrance showcasing fresh lychee, raspberry, white flowers, and light vanilla notes. Beautiful mini presentation box.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600', 'Wholesale Price Retailing', 1),
('gissah-one-only', 'Gissah One & Only EDP (30ml Spray)', 'retail_spray', 'A premium Arabian luxury spray offering deep oud and rich patchouli blended with sweet amber and vanilla. Extremely high longevity.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', 'Bestselling Mini', 1),
('her-confession', 'Her Confession by Lattafa (100ml)', 'retail_spray', 'A bold statement of femininity. A captivating blend that speaks of elegance, mystery, and confident attraction. Special wholesale campaign.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600', 'Mega Promo Offer', 1),
('lacoste-essential', 'Lacoste Essential (Mamba Edition, 125ml)', 'retail_spray', 'Feel fresh and irresistible with the Mamba Edition. A crisp, woody, and aromatic fragrance that keeps you confident all day long.', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', 'Mamba Edition', 1),
('rollon-3ml', '3ml Glass Roll-On Bottles (Per Dozen)', 'accessory', 'Leak-proof glass roll-on vials with gold caps. Pocket friendly and perfect for distributing custom 3ml oil perfume blends.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600', 'Wholesale Pack', 1),
('rollon-6ml', '6ml Glass Roll-On Bottles (Per Dozen)', 'accessory', 'Durable clear glass roll-on vials with elegant metallic caps. The perfect container size for your KES 10,000 Starter Pack oil business.', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600', 'Most Popular', 1),
('fancy-bottle-apple', 'Apple-Shape Fancy Glass Refillable Bottle (Each)', 'accessory', 'Sleek, apple-contoured refillable bottle with high-shine gold spray pump. Highly attractive for dressers and luxury gift sets.', 'https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600', 'Ksh 35 Only', 1),
('fancy-bottle-crown', 'Royal Crown Glass Display Bottle (Each)', 'accessory', 'Exquisite crown-shaped decorative display bottle. Perfect for premium decants of 15ml-30ml.', 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600', 'Premium Glass', 1),
('fancy-bottle-crystal', 'Diamond Facet Premium Decanter Bottle (Each)', 'accessory', 'Ultra-luxurious, heavy crystal-cut glass decanter bottle with multi-angled facets. Reflects light beautifully.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', 'Elite Elegance', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `product_variants` (`product_id`, `size_label`, `price`) VALUES
('oil_wholesale', '250ml', 1700.00),
('oil_wholesale', '500ml', 3200.00),
('oil_wholesale', '1 Litre', 6000.00),
('mayar-30ml', 'Standard', 150.00),
('gissah-one-only', 'Standard', 150.00),
('her-confession', 'Standard', 1500.00),
('lacoste-essential', 'Standard', 1000.00),
('rollon-3ml', 'Standard', 120.00),
('rollon-6ml', 'Standard', 130.00),
('fancy-bottle-apple', 'Standard', 35.00),
('fancy-bottle-crown', 'Standard', 75.00),
('fancy-bottle-crystal', 'Standard', 150.00);
