-- Arquivo de Schema do Banco de Dados Completo

-- Limpeza de tabelas existentes para um ambiente de desenvolvimento limpo
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `users`, `categories`, `colors`, `fabrics`, `products`, `product_images`, `product_curtains`, `product_cushions_pendants`, `customers`, `orders`, `order_items`;
SET FOREIGN_KEY_CHECKS=1;

-- Tabela de Usuários (Administradores)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Categorias de Produtos
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Cores
CREATE TABLE `colors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `hex_code` VARCHAR(7) NOT NULL,
  `photo_url` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tecidos (Estoque)
CREATE TABLE `fabrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `width` DECIMAL(10, 2) NOT NULL COMMENT 'em metros',
  `height` DECIMAL(10, 2) NOT NULL COMMENT 'em metros (rolo)',
  `color_id` INT,
  `image_url` VARCHAR(255) NULL,
  `stock_quantity_sqm` DECIMAL(10, 2) NOT NULL COMMENT 'em metros quadrados',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela Principal de Produtos
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `category_id` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Imagens dos Produtos (relação um-para-muitos)
CREATE TABLE `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `alt_text` VARCHAR(255),
  `sort_order` INT DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Detalhes para Cortinas
CREATE TABLE `product_curtains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL UNIQUE,
  `rail_type` VARCHAR(100) COMMENT 'Ex: Trilho Suíço, Varão',
  `rail_color` VARCHAR(100),
  `rail_width` DECIMAL(10, 2) COMMENT 'em metros',
  `fabric_id_main` INT NOT NULL COMMENT 'Tecido principal',
  `fabric_id_lining` INT NULL COMMENT 'Forro (opcional)',
  `fabric_id_voile` INT NULL COMMENT 'Voil (opcional)',
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`fabric_id_main`) REFERENCES `fabrics`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`fabric_id_lining`) REFERENCES `fabrics`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`fabric_id_voile`) REFERENCES `fabrics`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Detalhes para Almofadas e Pingentes
CREATE TABLE `product_cushions_pendants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL UNIQUE,
  `color_id` INT,
  `height` DECIMAL(10, 2) COMMENT 'em cm',
  `width` DECIMAL(10, 2) COMMENT 'em cm',
  `stock_quantity` INT NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Clientes
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20),
  `address_line1` VARCHAR(255),
  `address_line2` VARCHAR(255),
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `zip_code` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pedidos
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NULL,
  `guest_customer_details` JSON NULL COMMENT 'Para clientes não registrados',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  `stripe_session_id` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Itens do Pedido
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT 'Preço no momento da compra',
  `item_details_json` JSON NULL COMMENT 'Detalhes específicos do produto, como medidas da cortina',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ========================================
-- DADOS INICIAIS (SEED DATA)
-- ========================================

-- Usuário Admin
-- Senha para admin@example.com é 'password'
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`) VALUES
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Categorias
INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Cortinas'),
(2, 'Almofadas'),
(3, 'Pingentes');

-- Cores
INSERT INTO `colors` (`id`, `name`, `hex_code`) VALUES
(1, 'Bege', '#F5F5DC'),
(2, 'Cinza', '#808080'),
(3, 'Azul Marinho', '#000080'),
(4, 'Verde Musgo', '#8A9A5B'),
(5, 'Terracota', '#E2725B');

-- Tecidos
INSERT INTO `fabrics` (`id`, `name`, `width`, `height`, `color_id`, `stock_quantity_sqm`) VALUES
(1, 'Linho Premium', 2.80, 50.00, 1, 150.00),
(2, 'Veludo Luxo', 1.40, 30.00, 2, 80.00),
(3, 'Algodão Blackout', 2.80, 40.00, 3, 120.00),
(4, 'Voil Transparente', 2.80, 60.00, 1, 200.00),
(5, 'Jacquard Elegante', 1.40, 25.00, 4, 60.00);

-- Produtos - Cortinas
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `is_active`) VALUES
(1, 'Cortina Elegance Bege', 'Cortina em linho premium com acabamento sofisticado. Ideal para salas de estar e quartos que buscam elegância e sofisticação.', 450.00, 1, TRUE),
(2, 'Cortina Blackout Premium', 'Cortina blackout em tecido de alta qualidade que bloqueia 100% da luz. Perfeita para quartos e home theaters.', 580.00, 1, TRUE),
(3, 'Cortina Veludo Luxo', 'Cortina em veludo com caimento pesado e textura aveludada. Ideal para ambientes clássicos e elegantes.', 720.00, 1, TRUE),
(4, 'Cortina Voil Transparente', 'Cortina leve e delicada em voil transparente. Permite entrada de luz natural mantendo privacidade.', 320.00, 1, TRUE);

-- Produtos - Almofadas
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `is_active`) VALUES
(5, 'Almofada Decorativa Terracota', 'Almofada em tecido linho com enchimento de fibra siliconizada. Acabamento com zíper invisível.', 85.00, 2, TRUE),
(6, 'Almofada Veludo Cinza', 'Almofada em veludo macio com enchimento premium. Design contemporâneo e elegante.', 95.00, 2, TRUE),
(7, 'Almofada Bordada Verde', 'Almofada com bordado artesanal em tons de verde. Peça exclusiva e sofisticada.', 120.00, 2, TRUE);

-- Produtos - Pingentes
INSERT INTO `products` (`id`, `name`, `description`, `price`, `category_id`, `is_active`) VALUES
(8, 'Pingente Decorativo Dourado', 'Pingente em metal dourado com design clássico. Ideal para enfeitar cortinas e cenefas.', 45.00, 3, TRUE),
(9, 'Pingente Cristal Premium', 'Pingente com detalhes em cristal que refletem a luz. Design sofisticado e elegante.', 65.00, 3, TRUE);

-- Imagens dos Produtos
INSERT INTO `product_images` (`product_id`, `image_url`, `alt_text`, `sort_order`) VALUES
-- Cortinas
(1, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cortina Elegance Bege em sala de estar', 0),
(2, 'https://images.pexels.com/photos/923192/pexels-photo-923192.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cortina Blackout Premium em quarto', 0),
(3, 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cortina Veludo Luxo em ambiente clássico', 0),
(4, 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg?auto=compress&cs=tinysrgb&w=600', 'Cortina Voil Transparente em janela', 0),
-- Almofadas
(5, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Almofada Decorativa Terracota', 0),
(6, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Almofada Veludo Cinza', 0),
(7, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600', 'Almofada Bordada Verde', 0),
-- Pingentes
(8, 'https://images.pexels.com/photos/6633923/pexels-photo-6633923.jpeg?auto=compress&cs=tinysrgb&w=600', 'Pingente Decorativo Dourado', 0),
(9, 'https://images.pexels.com/photos/6633923/pexels-photo-6633923.jpeg?auto=compress&cs=tinysrgb&w=600', 'Pingente Cristal Premium', 0);

-- Detalhes das Cortinas
INSERT INTO `product_curtains` (`product_id`, `rail_type`, `rail_color`, `rail_width`, `fabric_id_main`, `fabric_id_lining`, `fabric_id_voile`) VALUES
(1, 'Trilho Suíço', 'Branco', 2.80, 1, NULL, 4),
(2, 'Varão Cromado', 'Cromado', 3.00, 3, NULL, NULL),
(3, 'Trilho Suíço', 'Preto', 2.50, 2, NULL, NULL),
(4, 'Varão Branco', 'Branco', 2.00, 4, NULL, NULL);

-- Detalhes das Almofadas e Pingentes
INSERT INTO `product_cushions_pendants` (`product_id`, `color_id`, `height`, `width`, `stock_quantity`) VALUES
(5, 5, 45.00, 45.00, 25),
(6, 2, 50.00, 50.00, 30),
(7, 4, 40.00, 60.00, 15),
(8, NULL, 15.00, 5.00, 50),
(9, NULL, 12.00, 4.00, 40);

-- Cliente de exemplo
INSERT INTO `customers` (`name`, `email`, `phone`, `city`, `state`) VALUES
('Maria Silva', 'maria.silva@example.com', '(45) 99999-8888', 'Medianeira', 'PR');