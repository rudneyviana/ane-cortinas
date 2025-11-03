CREATE DATABASE  IF NOT EXISTS `ane_cortinas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `ane_cortinas`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ane_cortinas
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,'Almofadas'),(1,'Cortinas'),(3,'Pingentes');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `hex_code` varchar(7) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'Bege','#F5F5DC',NULL),(2,'Cinza','#808080',NULL),(3,'Azul Marinho','#000080',NULL),(4,'Verde Musgo','#8A9A5B',NULL),(5,'Terracota','#E2725B',NULL);
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Maria Silva','maria.silva@gmail.com','(45) 99999-8888',NULL,NULL,'Medianeira','PR',NULL,'2025-10-27 19:10:06');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fabrics`
--

DROP TABLE IF EXISTS `fabrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fabrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `width` decimal(10,2) NOT NULL COMMENT 'em metros',
  `height` decimal(10,2) NOT NULL COMMENT 'em metros (rolo)',
  `color_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock_quantity_sqm` decimal(10,2) NOT NULL COMMENT 'em metros quadrados',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `color_id` (`color_id`),
  CONSTRAINT `fabrics_ibfk_1` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fabrics`
--

LOCK TABLES `fabrics` WRITE;
/*!40000 ALTER TABLE `fabrics` DISABLE KEYS */;
INSERT INTO `fabrics` VALUES (1,'Linho Premium',2.80,50.00,1,NULL,150.00,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(2,'Veludo Luxo',1.40,30.00,2,NULL,80.00,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(3,'Algodão Blackout',2.80,40.00,3,NULL,120.00,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(4,'Voil Transparente',2.80,60.00,1,NULL,200.00,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(5,'Jacquard Elegante',1.40,25.00,4,NULL,60.00,'2025-10-27 19:10:06','2025-10-27 19:10:06');
/*!40000 ALTER TABLE `fabrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL COMMENT 'Preço no momento da compra',
  `item_details_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detalhes específicos do produto, como medidas da cortina' CHECK (json_valid(`item_details_json`)),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,6,2,1,580.00,'{\"notes\": \"Cortina Blackout 2,80m\"}'),(2,6,8,2,45.00,NULL),(3,7,1,2,450.00,NULL),(4,7,5,3,85.00,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) DEFAULT NULL,
  `guest_customer_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Para clientes não registrados' CHECK (json_valid(`guest_customer_details`)),
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (6,NULL,'{\"name\": \"João Convidado\", \"email\": \"joao.convidado@gmail.com\", \"phone\": \"(45) 90000-0000\", \"address_line1\": \"Rua das Cortinas, 123\", \"city\": \"Medianeira\", \"state\": \"PR\"}',670.00,'pending',NULL,'2025-10-29 01:18:55','2025-10-29 01:18:55'),(7,1,NULL,1155.00,'processing',NULL,'2025-10-29 01:19:16','2025-10-29 01:19:16');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_curtains`
--

DROP TABLE IF EXISTS `product_curtains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_curtains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `rail_type` varchar(100) DEFAULT NULL COMMENT 'Ex: Trilho Suíço, Varão',
  `rail_color` varchar(100) DEFAULT NULL,
  `rail_width` decimal(10,2) DEFAULT NULL COMMENT 'em metros',
  `fabric_id_main` int(11) NOT NULL COMMENT 'Tecido principal',
  `fabric_id_lining` int(11) DEFAULT NULL COMMENT 'Forro (opcional)',
  `fabric_id_voile` int(11) DEFAULT NULL COMMENT 'Voil (opcional)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  KEY `fabric_id_main` (`fabric_id_main`),
  KEY `fabric_id_lining` (`fabric_id_lining`),
  KEY `fabric_id_voile` (`fabric_id_voile`),
  CONSTRAINT `product_curtains_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_curtains_ibfk_2` FOREIGN KEY (`fabric_id_main`) REFERENCES `fabrics` (`id`),
  CONSTRAINT `product_curtains_ibfk_3` FOREIGN KEY (`fabric_id_lining`) REFERENCES `fabrics` (`id`),
  CONSTRAINT `product_curtains_ibfk_4` FOREIGN KEY (`fabric_id_voile`) REFERENCES `fabrics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_curtains`
--

LOCK TABLES `product_curtains` WRITE;
/*!40000 ALTER TABLE `product_curtains` DISABLE KEYS */;
INSERT INTO `product_curtains` VALUES (1,1,'Trilho Suíço','Branco',2.80,1,NULL,4),(2,2,'Varão Cromado','Cromado',3.00,3,NULL,NULL),(3,3,'Trilho Suíço','Preto',2.50,2,NULL,NULL),(4,4,'Varão Branco','Branco',2.00,4,NULL,NULL);
/*!40000 ALTER TABLE `product_curtains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_cushions_pendants`
--

DROP TABLE IF EXISTS `product_cushions_pendants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_cushions_pendants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `color_id` int(11) DEFAULT NULL,
  `height` decimal(10,2) DEFAULT NULL COMMENT 'em cm',
  `width` decimal(10,2) DEFAULT NULL COMMENT 'em cm',
  `stock_quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  KEY `color_id` (`color_id`),
  CONSTRAINT `product_cushions_pendants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_cushions_pendants_ibfk_2` FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_cushions_pendants`
--

LOCK TABLES `product_cushions_pendants` WRITE;
/*!40000 ALTER TABLE `product_cushions_pendants` DISABLE KEYS */;
INSERT INTO `product_cushions_pendants` VALUES (1,5,5,45.00,45.00,25),(2,6,2,50.00,50.00,30),(3,7,4,40.00,60.00,15),(4,8,NULL,15.00,5.00,50);
/*!40000 ALTER TABLE `product_cushions_pendants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_details`
--

DROP TABLE IF EXISTS `product_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `detail_key` varchar(64) NOT NULL,
  `detail_value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_product_key` (`product_id`,`detail_key`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_details_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_details`
--

LOCK TABLES `product_details` WRITE;
/*!40000 ALTER TABLE `product_details` DISABLE KEYS */;
INSERT INTO `product_details` VALUES (1,1,'sku','CTN-0001'),(2,1,'stock_text','-'),(3,2,'sku','CTN-0002'),(4,2,'stock_text','30 un.'),(5,3,'sku','CTN-0003'),(6,3,'stock_text','30 un.'),(7,4,'sku','CTN-0004'),(8,4,'stock_text','30 un.'),(9,5,'sku','ALM-0001'),(10,5,'stock_text','25 un.'),(11,6,'sku','ALM-0002'),(12,6,'stock_text','30 un.'),(13,7,'sku','ALM-0003'),(14,7,'stock_text','10 un.'),(15,8,'sku','PNG-0001'),(16,8,'stock_text','50 un.'),(26,9,'sku','PNG-0002'),(27,9,'stock_text','40 un.');
/*!40000 ALTER TABLE `product_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;

INSERT INTO `product_images` (`id`,`product_id`,`image_url`,`alt_text`,`sort_order`) VALUES (1,1,'/ane-cortinas/images/Cortina%20Elegance%20Bege%20em%20sala%20de%20estar.png','Cortina Elegance Bege em sala de estar',0),(2,2,'/ane-cortinas/images/Cortina%20Blackout%20Premium%20em%20quarto.png','Cortina Blackout Premium em quarto',0),(3,3,'/ane-cortinas/images/Cortina%20Veludo%20Luxo%20em%20ambiente%20cl%C3%A1ssico.png','Cortina Veludo Luxo em ambiente clássico',0),(4,4,'/ane-cortinas/images/Cortina%20Voil%20Transparente%20em%20janela.png','Cortina Voil Transparente em janela',0),(5,5,'/ane-cortinas/images/Almofada%20Decorativa%20Terracota.png','Almofada Decorativa Terracota',0),(6,6,'/ane-cortinas/images/Almofada%20Veludo%20Cinza.png','Almofada Veludo Cinza',0),(7,7,'/ane-cortinas/images/Almofada%20Bordada%20Verde.png','Almofada Bordada Verde',0),(8,8,'/ane-cortinas/images/Pingente%20Decorativo%20Dourado.png','Pingente Decorativo Dourado',0),(9,9,'/ane-cortinas/images/Pingente%20Cristal%20Premium.png','Pingente Cristal Premium',0);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Cortina Elegance Bege','Cortina em linho premium com acabamento sofisticado. Ideal para salas de estar e quartos que buscam elegância e sofisticação.',450.00,1,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(2,'Cortina Blackout Premium','Cortina blackout em tecido de alta qualidade que bloqueia 100% da luz. Perfeita para quartos e home theaters.',580.00,1,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(3,'Cortina Veludo Luxo','Cortina em veludo com caimento pesado e textura aveludada. Ideal para ambientes clássicos e elegantes.',720.00,1,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(4,'Cortina Voil Transparente','Cortina leve e delicada em voil transparente. Permite entrada de luz natural mantendo privacidade.',320.00,1,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(5,'Almofada Decorativa Terracota','Almofada em tecido linho com enchimento de fibra siliconizada. Acabamento com zíper invisível.',85.00,2,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(6,'Almofada Veludo Cinza','Almofada em veludo macio com enchimento premium. Design contemporâneo e elegante.',95.00,2,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(7,'Almofada Bordada Verde','Almofada com bordado artesanal em tons de verde. Peça exclusiva e sofisticada.',120.00,2,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(8,'Pingente Decorativo Dourado','Pingente em metal dourado com design clássico. Ideal para enfeitar cortinas e cenefas.',45.00,3,1,'2025-10-27 19:10:06','2025-10-27 19:10:06'),(9,'Pingente Cristal Premium','Pingente com detalhes em cristal que refletem a luz. Design sofisticado e elegante.',65.00,3,1,'2025-10-27 22:10:06','2025-10-27 22:10:06');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@anecortinas.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','ADMIN','2025-10-27 19:10:05'),(2,'Teste Usuario','teste@anecortinas.com','$2y$10$fC1VxZN5vstd2sasIO/hY.BUu1as0s739cZEIrQAYSvIkdcQ66T2e','CUSTOMER','2025-10-27 20:06:43'),(3,'Teste Admin','teste-admin@anecortinas.com','$2y$10$1GBgNnwChCaSDJdCqLywBeVBQaqne.fuJVG/iM9blEdyixzZXzom6','ADMIN','2025-10-28 00:00:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ane_cortinas'
--

--
-- Dumping routines for database 'ane_cortinas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-03  0:57:24
