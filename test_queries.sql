-- ========================================
-- QUERIES DE TESTE PARA VERIFICAR O BANCO
-- Execute estas queries no phpMyAdmin para confirmar que está tudo OK
-- ========================================

-- 1. Verificar se há 9 produtos
SELECT COUNT(*) as total_produtos FROM products;
-- Resultado esperado: 9

-- 2. Verificar se há 3 categorias
SELECT COUNT(*) as total_categorias FROM categories;
-- Resultado esperado: 3

-- 3. Verificar se há 9 imagens (uma para cada produto)
SELECT COUNT(*) as total_imagens FROM product_images;
-- Resultado esperado: 9

-- 4. Listar todos os produtos com suas categorias
SELECT 
    p.id,
    p.name,
    p.price,
    c.name as categoria
FROM products p 
JOIN categories c ON p.category_id = c.id
ORDER BY p.id;
-- Resultado esperado: 9 linhas

-- 5. Verificar produtos por categoria
SELECT 
    c.name as categoria,
    COUNT(p.id) as quantidade_produtos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;
-- Resultado esperado:
-- Cortinas: 4
-- Almofadas: 3
-- Pingentes: 2

-- 6. Verificar se todas as imagens têm URLs válidas
SELECT 
    pi.id,
    p.name as produto,
    pi.image_url
FROM product_images pi
JOIN products p ON pi.product_id = p.id
ORDER BY p.id;
-- Resultado esperado: 9 linhas com URLs de imagens

-- 7. Verificar se o usuário admin existe
SELECT id, name, email, role FROM users WHERE role = 'ADMIN';
-- Resultado esperado: 1 linha (admin@example.com)

-- 8. Verificar produtos ativos
SELECT COUNT(*) as produtos_ativos FROM products WHERE is_active = 1;
-- Resultado esperado: 9 (todos ativos)

-- 9. Verificar detalhes das cortinas
SELECT 
    p.name as cortina,
    pc.rail_type,
    pc.rail_color,
    pc.rail_width
FROM products p
JOIN product_curtains pc ON p.id = pc.product_id
ORDER BY p.id;
-- Resultado esperado: 4 cortinas com detalhes

-- 10. Verificar detalhes de almofadas e pingentes
SELECT 
    p.name as produto,
    c.name as categoria,
    pcp.height,
    pcp.width,
    pcp.stock_quantity
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN product_cushions_pendants pcp ON p.id = pcp.product_id
ORDER BY p.id;
-- Resultado esperado: 5 produtos (3 almofadas + 2 pingentes)

-- 11. Simular consulta da API (igual ao que o PHP faz)
SELECT 
    p.*,
    c.name as category_name
FROM products p 
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1
ORDER BY p.id;
-- Resultado esperado: 9 produtos com category_name

-- 12. Verificar preços (para testar filtro de preço)
SELECT 
    name,
    price,
    c.name as categoria
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE price <= 100
ORDER BY price;
-- Resultado esperado: 3 produtos (2 pingentes + 1 almofada)

-- 13. Verificar se há tecidos cadastrados
SELECT COUNT(*) as total_tecidos FROM fabrics;
-- Resultado esperado: 5

-- 14. Verificar se há cores cadastradas
SELECT COUNT(*) as total_cores FROM colors;
-- Resultado esperado: 5

-- 15. Query completa para debug (mostra TUDO)
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.is_active,
    c.name as categoria,
    pi.image_url,
    pi.alt_text
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.id, pi.sort_order;
-- Resultado esperado: 9 linhas com todos os detalhes

-- ========================================
-- SE ALGUMA QUERY ACIMA DER ERRO OU RESULTADO DIFERENTE:
-- 1. Reimporte o arquivo database.sql
-- 2. Verifique se o banco se chama 'ane_cortinas'
-- 3. Verifique se o usuário é 'root' sem senha
-- ========================================