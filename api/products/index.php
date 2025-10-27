<?php
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../models/Product.php';

$productModel = new Product();
$products = $productModel->getAll();

Response::json(['products' => $products]);
